const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedFict2B() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'db_absensi'
  });

  console.log('🌱 Seeding FICT-2B + Deden Mobile 2 + IoT data...');

  try {
    // 1. Create Kelas FICT-2B
    const [kelasCheck] = await connection.query("SELECT id_kelas FROM kelas WHERE nama_kelas = 'FICT-2B'");
    if (kelasCheck.length === 0) {
      const [kelasRes] = await connection.query(
        "INSERT INTO kelas (nama_kelas, prodi, keterangan) VALUES ('FICT-2B', 'Fakultas Ilmu Komputer', 'Mobile Dev Class')"
      );
      console.log(`✅ FICT-2B kelas created with ID: ${kelasRes.insertId}`);
    } else {
      console.log('FICT-2B already exists');
    }

    const kelasId = kelasCheck[0]?.id_kelas || (await connection.query("SELECT LAST_INSERT_ID() as id"))[0].id;

    // 2. Create Dosen Pa Deden
    const [dosenCheck] = await connection.query("SELECT id_user FROM pengguna WHERE nama = 'Pa Deden'");
    if (dosenCheck.length === 0) {
      const salt = await require('bcryptjs').genSalt(10);
      const hashedPass = await require('bcryptjs').hash('123456', salt);
      const [dosenRes] = await connection.query(
        "INSERT INTO pengguna (nama, username, password, role, status) VALUES ('Pa Deden', 'pa_deden', ?, 'dosen', 'Y')",
        [hashedPass]
      );
      console.log(`✅ Pa Deden created with ID: ${dosenRes.insertId}`);
    } else {
      console.log('Pa Deden already exists');
    }

    const dosenId = dosenCheck[0]?.id_user || (await connection.query("SELECT LAST_INSERT_ID() as id"))[0].id;

    // 3. Create Mata Kuliah Mobile 2
    const [mkCheck] = await connection.query("SELECT id_mk FROM mata_kuliah WHERE nama_mk = 'Mobile 2'");
    if (mkCheck.length === 0) {
      const [mkRes] = await connection.query(
        "INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, status) VALUES ('MOB002', 'Mobile 2', 3, 'Y')"
      );
      console.log(`✅ Mobile 2 created with ID: ${mkRes.insertId}`);
    } else {
      console.log('Mobile 2 already exists');
    }

    const mkId = mkCheck[0]?.id_mk || (await connection.query("SELECT LAST_INSERT_ID() as id"))[0].id;

    // 4. Create Jadwal
    const [jadwalCheck] = await connection.query(
      "SELECT id_jadwal FROM jadwal_kuliah WHERE kelas_id = ? AND mata_kuliah_id = ? AND dosen_id = ?",
      [kelasId, mkId, dosenId]
    );
    
    if (jadwalCheck.length === 0) {
      const [jadwalRes] = await connection.query(
        "INSERT INTO jadwal_kuliah (dosen_id, mata_kuliah_id, kelas_id, hari, jam_mulai, jam_selesai, ruang) VALUES (?, ?, ?, 'senin', '08:00:00', '10:00:00', 'Ruang 203')"
      , [dosenId, mkId, kelasId]);
      console.log(`✅ Jadwal Mobile 2 FICT-2B created ID: ${jadwalRes.insertId}`);
      
      // Add second jadwal lab
      await connection.query(
        "INSERT INTO jadwal_kuliah (dosen_id, mata_kuliah_id, kelas_id, hari, jam_mulai, jam_selesai, ruang) VALUES (?, ?, ?, 'rabu', '13:00:00', '15:00:00', 'Lab iOS Lantai 2')",
        [dosenId, mkId, kelasId]
      );
      console.log('✅ Lab jadwal added');
    }

    const jadwalId = jadwalCheck[0]?.id_jadwal || (await connection.query("SELECT LAST_INSERT_ID() as id"))[0].id;

    // 5. Create 10 Dummy Mahasiswa for FICT-2B
    const mahasiswaNames = [
      'Ahmad Rizky', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Eko Prabowo',
      'Fitriani', 'Gilang Ramadhan', 'Hana Safitri', 'Iwan Kurniawan', 'Jihan Putri'
    ];

    const studentIds = [];
    for (const nama of mahasiswaNames) {
      const salt = await require('bcryptjs').genSalt(10);
      const hashedPass = await require('bcryptjs').hash('123456', salt);
      const [res] = await connection.query(
        "INSERT IGNORE INTO pengguna (nama, username, password, role, status) VALUES (?, CONCAT('fict', LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(username,5)),0))+1, 4, '0')), ?, 'mahasiswa', 'Y')",
        [nama, hashedPass]
      );
      const userId = res.insertId || (await connection.query("SELECT id_user FROM pengguna WHERE nama = ? AND role = 'mahasiswa'", [nama]))[0].id_user;
      
      await connection.query("INSERT IGNORE INTO mahasiswa_kelas (mahasiswa_id, kelas_id) VALUES (?, ?)", [userId, kelasId]);
      studentIds.push(userId);
      console.log(`✅ Mahasiswa ${nama} enrolled`);
    }

    // 6. Create Dummy Absensi + IoT Validation
    console.log('- Creating IoT face validation absensi...');
    const statuses = ['hadir', 'terlambat', 'hadir', 'alfa', 'hadir', 'terlambat', 'hadir', 'alfa', 'hadir', 'hadir'];
    
    for (let i = 0; i < studentIds.length; i++) {
      await connection.query(
        "INSERT INTO absensi (user_id, jadwal_id, tanggal, waktu_datang, status, lokasi_kelas) VALUES (?, ?, CURDATE(), ADDTIME('08:15:00', SEC_TO_TIME(FLOOR(RAND()*1800))), ?, 'ESP32 Lab iOS - IoT Face Validated')",
        [studentIds[i], jadwalId, statuses[i]]
      );
      
      // Log deteksi wajah IoT
      await connection.query(
        "INSERT INTO log_deteksi (user_id, device_id, confidence, lokasi_kelas, time) VALUES (?, 'ESP32-001', 0.95 + RAND()*0.04, 'Ruang 203 / Lab iOS', NOW())",
        [studentIds[i]]
      );
    }

    console.log('✅ FICT-2B + Pa Deden Mobile 2 + IoT data COMPLETE!');
    console.log(`📊 Kelas ID: ${kelasId}, Dosen ID: ${dosenId}, Jadwal ID: ${jadwalId}`);
    console.log('Run backend server dan test AdminJadwalScreen!');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await connection.end();
  }
}

seedFict2B();

