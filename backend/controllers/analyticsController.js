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
      'SELECT * FROM absensi WHERE DATE(tanggal) = ?',
      [todayStr]
    );
    
    const attendedCount = todayAttendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0;
    
    // Calculate Late Arrivals (after 08:00 AM)
    const lateCount = todayAttendance.filter(record => {
      if (!record.waktu_datang) return false;
      const [hours, minutes] = record.waktu_datang.split(':').map(Number);
      return hours > 8 || (hours === 8 && minutes > 0);
    }).length;

    // 3. Weekly Trend (Last 7 Days)
    const [trendData] = await db.query(
      `SELECT DATE(tanggal) as date, COUNT(*) as count 
       FROM absensi 
       WHERE tanggal >= DATE(NOW()) - INTERVAL 6 DAY 
       GROUP BY DATE(tanggal) 
       ORDER BY DATE(tanggal) ASC`
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
      `SELECT k.nama_kelas as name, COUNT(*) as count 
       FROM absensi a
       JOIN jadwal_kuliah jk ON a.jadwal_id = jk.id_jadwal
       JOIN kelas k ON jk.kelas_id = k.id_kelas
       WHERE DATE(a.tanggal) = ? AND k.nama_kelas IS NOT NULL AND k.nama_kelas != '-'
       GROUP BY k.nama_kelas`,
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

exports.getSuspiciousLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT * FROM suspicious_logs ORDER BY created_at DESC LIMIT 50`
    );
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching suspicious logs:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAIHealth = async (req, res) => {
  try {
    // Basic AI health stats
    const [spoofCount] = await db.query(`SELECT COUNT(*) as count FROM suspicious_logs WHERE event_type = 'SPOOF_ATTEMPT'`);
    const [unknownCount] = await db.query(`SELECT COUNT(*) as count FROM suspicious_logs WHERE event_type = 'UNKNOWN_FACE'`);
    const [avgConfidence] = await db.query(`SELECT AVG(confidence) as avg FROM suspicious_logs WHERE confidence > 0`);
    
    return res.status(200).json({
      success: true,
      data: {
        engineActive: true,
        cacheStatus: 'Loaded', // since we have an in-memory cache now
        spoofAttempts: spoofCount[0].count,
        unknownFaces: unknownCount[0].count,
        averageSuspiciousConfidence: avgConfidence[0].avg ? parseFloat(avgConfidence[0].avg).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching AI Health:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMapData = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const [attendances] = await db.query(
      `SELECT a.*, p.nama as name, p.role 
       FROM absensi a
       LEFT JOIN pengguna p ON a.user_id = p.id_user
       WHERE DATE(a.tanggal) = ? AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL`,
      [todayStr]
    );

    return res.status(200).json({ success: true, data: attendances });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getHeatmapAnalytics = async (req, res) => {
  try {
    // Hourly attendance aggregation
    const [hourlyData] = await db.query(`
      SELECT HOUR(waktu_datang) as hour, COUNT(*) as count 
      FROM absensi 
      WHERE waktu_datang IS NOT NULL
      GROUP BY HOUR(waktu_datang)
      ORDER BY hour ASC
    `);

    // Day of week aggregation
    const [dailyData] = await db.query(`
      SELECT DAYOFWEEK(tanggal) as day_idx, COUNT(*) as count 
      FROM absensi 
      WHERE tanggal IS NOT NULL
      GROUP BY DAYOFWEEK(tanggal)
      ORDER BY day_idx ASC
    `);

    // Late distribution
    const [lateDistribution] = await db.query(`
      SELECT status_telat, COUNT(*) as count 
      FROM absensi 
      GROUP BY status_telat
    `);

    return res.status(200).json({
      success: true,
      data: {
        hourly: hourlyData,
        daily: dailyData,
        lateDistribution: lateDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching heatmap analytics:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
