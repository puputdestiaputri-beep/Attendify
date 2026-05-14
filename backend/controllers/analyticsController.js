const db = require('../config/db');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Registered Students (Role Mahasiswa)
    const [totalStudentsResult] = await db.query(
      'SELECT COUNT(*) as count FROM pengguna WHERE role = "mahasiswa"'
    );
    const totalStudents = totalStudentsResult[0].count;

    // 2. Today's Attendance Stats
    const [todayAttendance] = await db.query(
      'SELECT * FROM attendance WHERE DATE(created_at) = ?',
      [todayStr]
    );
    
    const attendedCount = todayAttendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0;
    
    // Calculate Late Arrivals (after 08:00 AM)
    const lateCount = todayAttendance.filter(record => {
      const time = new Date(record.created_at);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      return hours > 8 || (hours === 8 && minutes > 0);
    }).length;

    // 3. Weekly Trend (Last 7 Days)
    const [trendData] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM attendance 
       WHERE created_at >= DATE(NOW()) - INTERVAL 6 DAY 
       GROUP BY DATE(created_at) 
       ORDER BY DATE(created_at) ASC`
    );

    // Format trend data for charting (e.g. Mon: 5, Tue: 10)
    const labels = [];
    const dataPoints = [];
    
    // Fill in last 7 days to ensure continuous chart even with 0 attendance
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = trendData.find(t => new Date(t.date).toISOString().split('T')[0] === dateStr);
      labels.push(dayName);
      dataPoints.push(found ? found.count : 0);
    }

    // 4. Class Breakdown (Pie Chart)
    const [classBreakdown] = await db.query(
      `SELECT kelas as name, COUNT(*) as count 
       FROM attendance 
       WHERE DATE(created_at) = ? AND kelas IS NOT NULL AND kelas != '-'
       GROUP BY kelas`,
      [todayStr]
    );
    
    const pieData = classBreakdown.map((item, index) => {
      const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];
      return {
        name: item.name,
        population: item.count,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });

    // 5. Actionable Insights
    let highestClass = "N/A";
    if (classBreakdown.length > 0) {
      const maxClass = classBreakdown.reduce((prev, current) => (prev.count > current.count) ? prev : current);
      highestClass = maxClass.name;
    }

    const insights = [
      `Attendance is at ${attendancePercentage}% today.`,
      classBreakdown.length > 0 ? `${highestClass} has the highest attendance today.` : "No class attendance recorded yet.",
      lateCount > 0 ? `${lateCount} student(s) arrived late today.` : "Everyone arrived on time today!"
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        attendedCount,
        attendancePercentage,
        lateCount,
        trend: {
          labels,
          data: dataPoints
        },
        classBreakdown: pieData,
        insights
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error retrieving analytics' });
  }
};
