const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedJadwalPerHari() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'db_absensi'
  });

  // Contoh data jadwal per hari
  const jadwal = [
    // Senin
    { hari: 'senin', kelas: 'IF-4A', matkul: 'Kecerdasan Buatan', dosen: 'Dr. Budi Santoso', jam_mulai: '08:00', jam_selesai: '09:40', ruang: 'Lab 1' },
    { hari: 'senin', kelas: 'IF-2B', matkul: 'Algoritma', dosen: 'Dr. Siti Aminah', jam_mulai: '10:00', jam_selesai: '11:40', ruang: 'Lab 2' },
    // Selasa
    { hari: 'selasa', kelas: 'IF-4A', matkul: 'Pemrograman Web', dosen: 'Dr. Siti Aminah', jam_mulai: '08:00', jam_selesai: '09:40', ruang: 'Lab 1' },
    { hari: 'selasa', kelas: 'IF-4C', matkul: 'Sistem Database', dosen: 'Dr. Ahmad Kadir', jam_mulai: '10:00', jam_selesai: '11:40', ruang: 'Lab 3' },
    // Tambahkan hari & kelas lain sesuai kebutuhan
  ];

  for (const j of jadwal) {
    // Ambil id kelas, dosen, matkul
    const [[kelas]] = await connection.query("SELECT id_kelas FROM kelas WHERE nama_kelas=?", [j.kelas]);
    const [[dosen]] = await connection.query("SELECT id_user FROM pengguna WHERE nama=?", [j.dosen]);
    const [[mk]] = await connection.query("SELECT id_mk FROM mata_kuliah WHERE nama_mk=?", [j.matkul]);
    if (kelas && dosen && mk) {
      await connection.query(
        "INSERT INTO jadwal_kuliah (mata_kuliah_id, dosen_id, kelas_id, ruang, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [mk.id_mk, dosen.id_user, kelas.id_kelas, j.ruang, j.hari, j.jam_mulai, j.jam_selesai]
      );
    }
  }
  console.log('✅ Jadwal per hari seeded!');
  await connection.end();
}

seedJadwalPerHari();
