const db = require('./config/db');

async function simulateData() {
  try {
    console.log("Starting Demo Simulation Seed...");

    // Fetch all active mahasiswa
    const [mahasiswa] = await db.query(`SELECT id_user, nama FROM pengguna WHERE role = 'mahasiswa' AND status = 'Y'`);
    if (mahasiswa.length === 0) {
      console.log("No mahasiswa found to simulate.");
      return;
    }

    // Fetch active cameras
    const [cameras] = await db.query(`SELECT id_kamera FROM kamera WHERE status = 'aktif'`);
    const cameraId = cameras.length > 0 ? cameras[0].id_kamera : null;

    // Fetch all schedules
    const [jadwal] = await db.query(`SELECT id_jadwal, jam_mulai, jam_selesai, hari FROM jadwal_kuliah`);
    if (jadwal.length === 0) {
        console.log("No schedules found to simulate.");
        return;
    }

    const today = new Date();
    const daysToSimulate = 7;
    let recordsInserted = 0;

    for (let i = 0; i < daysToSimulate; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - i);
      
      // Map JS day (0=Sun, 1=Mon, ..., 6=Sat) to enum in DB
      const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
      const currentDayEnum = dayNames[targetDate.getDay()];

      if (currentDayEnum === 'minggu') continue; // Skip Sunday

      // Find schedule for this day
      const dailySchedules = jadwal.filter(j => j.hari === currentDayEnum);

      for (let sched of dailySchedules) {
        for (let mhs of mahasiswa) {
            // Randomly decide if student attended (90% chance)
            const attended = Math.random() < 0.90;
            if (!attended) continue;

            // Randomly decide if late (15% chance of being late)
            const isLate = Math.random() < 0.15;
            const status = isLate ? 'terlambat' : 'hadir';

            // Generate a random time around jam_mulai
            const [h_mulai, m_mulai, s_mulai] = sched.jam_mulai.split(':').map(Number);
            let timeOffsetMin = isLate ? Math.floor(Math.random() * 30) + 16 : -Math.floor(Math.random() * 15); // if late: 16-45 mins after. if on-time: 0-15 mins before
            
            const dateStr = targetDate.toISOString().split('T')[0];
            const timeObj = new Date(`${dateStr}T${sched.jam_mulai}Z`);
            timeObj.setMinutes(timeObj.getMinutes() + timeOffsetMin);
            
            const timeStr = timeObj.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS
            const datetimeStr = `${dateStr} ${timeStr}`;

            const lat = "-6.2088";
            const lng = "106.8456";
            const locName = "Kampus Utama Gedung A";

            await db.query(
                `INSERT INTO absensi (user_id, kamera_id, jadwal_id, tanggal, waktu_datang, status, status_telat, submitted_by_role, latitude, longitude, location_name) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mhs.id_user, 
                    cameraId, 
                    sched.id_jadwal, 
                    datetimeStr, 
                    timeStr, 
                    status, 
                    isLate ? 'ya' : 'tidak', 
                    'system',
                    lat, lng, locName
                ]
            );
            recordsInserted++;
        }
      }
    }

    console.log(`Successfully inserted ${recordsInserted} simulated attendance records.`);

  } catch (err) {
    console.error("Simulation Seed Failed:", err);
  } finally {
    process.exit();
  }
}

simulateData();
