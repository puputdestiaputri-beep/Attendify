const db = require('./backend/config/db');

async function seed() {
    try {
        console.log('🚀 Seeding Notifications & Admin...');

        // 1. Ensure Admin exists
        const [admins] = await db.query('SELECT id_user FROM pengguna WHERE role = "admin"');
        let adminId;
        if (admins.length === 0) {
            console.log('➕ Creating Admin...');
            const [result] = await db.query(
                "INSERT INTO pengguna (nama, nohp, username, password, role, status) VALUES ('Super Admin', '0812345678', 'admin', 'admin123', 'admin', 'Y')"
            );
            adminId = result.insertId;
        } else {
            adminId = admins[0].id_user;
        }

        // 2. Add some test notifications
        console.log('➕ Adding Sample Notifications...');
        const samples = [
            { judul: 'Laporan: Kamera Rusak', pesan: 'Kamera di ruang 402 tidak mau menyala sejak pagi ini.', jenis: 'informasi' },
            { judul: 'Laporan: Jadwal Bentrok', pesan: 'Jadwal PBO kelas A bentrok dengan Jaringan Komputer.', jenis: 'informasi' },
            { judul: 'Absensi: Terlambat', pesan: 'Mahasiswa Ahmad Dani terlambat 15 menit di MK Web.', jenis: 'terlambat' },
            { judul: 'Pesan Sistem', pesan: 'Sistem absensi wajah telah diperbarui ke versi 1.2', jenis: 'informasi' }
        ];

        for (const s of samples) {
            await db.query(
                'INSERT INTO notifikasi (user_id, judul, pesan, jenis_notif, tanggal, status_baca) VALUES (?, ?, ?, ?, NOW(), "belum")',
                [adminId, s.judul, s.pesan, s.jenis]
            );
        }

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
