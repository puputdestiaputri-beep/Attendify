const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'db_absensi'
  });

  console.log('🌱 Seeding dummy data...');

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('123456', salt);

    // 1. Clear existing data (Optional, but good for clean seed)
    // Be careful with this in production!
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE absensi');
    await connection.query('TRUNCATE TABLE mahasiswa_kelas');
    await connection.query('TRUNCATE TABLE jadwal_kuliah');
    await connection.query('TRUNCATE TABLE mata_kuliah');
    await connection.query('TRUNCATE TABLE kelas');
    // Keep admin user, but delete others
    await connection.query("DELETE FROM pengguna WHERE role != 'admin'");
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Create Classes
    console.log('- Creating classes...');
    const [kelasResult] = await connection.query(`
      INSERT INTO kelas (nama_kelas, prodi, keterangan) VALUES 
      ('IF-4A', 'informatika', 'Reguler Pagi'),
      ('IF-4B', 'informatika', 'Reguler Pagi'),
      ('SI-2A', 'sistem informasi', 'Reguler Sore'),
      ('TI-6A', 'teknologi informasi', 'Reguler Malam')
    `);
    const kelasIds = [0, 1, 2, 3].map(i => kelasResult.insertId + i);

    // 3. Create Subjects
    console.log('- Creating subjects...');
    const [mkResult] = await connection.query(`
      INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, status) VALUES 
      ('MK001', 'Pemrograman Web 2', 3, 'Y'),
      ('MK002', 'Kecerdasan Buatan', 3, 'Y'),
      ('MK003', 'Basis Data Terdistribusi', 3, 'Y'),
      ('MK004', 'Keamanan Jaringan', 2, 'Y'),
      ('MK005', 'Etika Profesi', 2, 'Y')
    `);
    const mkIds = [0, 1, 2, 3, 4].map(i => mkResult.insertId + i);

    // 4. Create Lecturers
    console.log('- Creating lecturers...');
    const [dosenResult] = await connection.query(`
      INSERT INTO pengguna (nama, username, password, role, status) VALUES 
      ('Dr. Ahmad Fauzi', 'dosen1', '${hashedPass}', 'dosen', 'Y'),
      ('Siti Aminah, M.Kom', 'dosen2', '${hashedPass}', 'dosen', 'Y'),
      ('Budi Santoso, Ph.D', 'dosen3', '${hashedPass}', 'dosen', 'Y')
    `);
    const dosenIds = [0, 1, 2].map(i => dosenResult.insertId + i);

    // 5. Create Students
    console.log('- Creating students...');
    const students = [
      ['Rian Hidayat', '22001', 'mahasiswa'],
      ['Lestari Putri', '22002', 'mahasiswa'],
      ['Andi Wijaya', '22003', 'mahasiswa'],
      ['Dewi Lestari', '22004', 'mahasiswa'],
      ['Bambang Pamungkas', '22005', 'mahasiswa'],
      ['Citra Kirana', '22006', 'mahasiswa'],
      ['Eko Prasetyo', '22007', 'mahasiswa'],
      ['Fanny Ghassani', '22008', 'mahasiswa'],
      ['Gilang Dirga', '22009', 'mahasiswa'],
      ['Hesti Purwadinata', '22010', 'mahasiswa']
    ];

    const studentIds = [];
    for (const s of students) {
      const [res] = await connection.query(
        'INSERT INTO pengguna (nama, username, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [s[0], s[1], hashedPass, s[2], 'Y']
      );
      studentIds.push(res.insertId);
    }

    // 6. Enroll Students into Classes (mahasiswa_kelas)
    console.log('- Enrolling students...');
    // Class IF-4A (ID: 0) gets 5 students
    for (let i = 0; i < 5; i++) {
      await connection.query('INSERT INTO mahasiswa_kelas (mahasiswa_id, kelas_id) VALUES (?, ?)', [studentIds[i], kelasIds[0]]);
    }
    // Class IF-4B (ID: 1) gets 5 students
    for (let i = 5; i < 10; i++) {
      await connection.query('INSERT INTO mahasiswa_kelas (mahasiswa_id, kelas_id) VALUES (?, ?)', [studentIds[i], kelasIds[1]]);
    }

    // 7. Create Weekly Schedules (jadwal_kuliah)
    console.log('- Creating schedules...');
    const schedules = [
      [dosenIds[0], mkIds[0], kelasIds[0], 'senin', '08:00:00', '10:30:00', 'Lab Komputer 1'],
      [dosenIds[1], mkIds[1], kelasIds[0], 'senin', '13:00:00', '15:30:00', 'Ruang 402'],
      [dosenIds[2], mkIds[2], kelasIds[1], 'selasa', '08:00:00', '10:30:00', 'Lab Komputer 2'],
      [dosenIds[0], mkIds[3], kelasIds[1], 'rabu', '10:00:00', '12:00:00', 'Ruang 305'],
      [dosenIds[1], mkIds[4], kelasIds[0], 'kamis', '08:00:00', '10:00:00', 'Ruang 101'],
      [dosenIds[2], mkIds[0], kelasIds[1], 'jumat', '14:00:00', '16:30:00', 'Lab Komputer 1'],
      [dosenIds[0], mkIds[1], kelasIds[0], 'sabtu', '09:00:00', '11:30:00', 'Ruang Virtual 1']
    ];

    const scheduleIds = [];
    for (const sc of schedules) {
      const [res] = await connection.query(
        'INSERT INTO jadwal_kuliah (dosen_id, mata_kuliah_id, kelas_id, hari, jam_mulai, jam_selesai, ruang) VALUES (?, ?, ?, ?, ?, ?, ?)',
        sc
      );
      scheduleIds.push(res.insertId);
    }

    // 8. Create some Attendance records (absensi) for Today
    console.log('- Creating today\'s attendance records...');
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayName = days[new Date().getDay()];
    
    const todaySchedules = scheduleIds.filter((id, index) => schedules[index][3] === todayName);

    for (const schedId of todaySchedules) {
        // Find which class this schedule belongs to
        const [schedInfo] = await connection.query('SELECT kelas_id FROM jadwal_kuliah WHERE id_jadwal = ?', [schedId]);
        const classId = schedInfo[0].kelas_id;
        
        // Find students in this class
        const [classStudents] = await connection.query('SELECT mahasiswa_id FROM mahasiswa_kelas WHERE kelas_id = ?', [classId]);
        
        // Make 3 out of 5 students present
        for (let i = 0; i < 3; i++) {
            await connection.query(
                'INSERT INTO absensi (user_id, jadwal_id, tanggal, waktu_datang, status) VALUES (?, ?, NOW(), CURTIME(), ?)',
                [classStudents[i].mahasiswa_id, schedId, 'hadir']
            );
        }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await connection.end();
  }
}

seed();
