const db = require('./backend/config/db');

async function seed() {
    try {
        console.log('Starting seed...');

        // 1. Create Kelas
        const [kelas] = await db.query('SELECT * FROM kelas');
        if (kelas.length === 0) {
            await db.query(`INSERT INTO kelas (nama_kelas, prodi, keterangan) VALUES 
                ('A Pagi', 'Informatika', 'Ruang 201'),
                ('B Sore', 'Sistem Informasi', 'Ruang 305')`);
            console.log('Added classes.');
        }

        // 2. Create Mata Kuliah
        const [mk] = await db.query('SELECT * FROM mata_kuliah');
        if (mk.length === 0) {
            await db.query(`INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, status) VALUES 
                ('IF101', 'Pemrograman Berorientasi Objek', 3, 'aktif'),
                ('SI202', 'Basis Data', 4, 'aktif')`);
            console.log('Added subjects.');
        }

        // 3. Create Jadwal
        const [jadwal] = await db.query('SELECT * FROM jadwal_kuliah');
        if (jadwal.length === 0) {
            // Assuming first user is admin/dosen with id 1
            await db.query(`INSERT INTO jadwal_kuliah (dosen_id, mata_kuliah_id, kelas_id, hari, jam_mulai, jam_selesai, ruang) VALUES 
                (1, 1, 1, 'Senin', '08:00:00', '10:30:00', '201'),
                (1, 2, 2, 'Selasa', '14:00:00', '16:30:00', '305')`);
            console.log('Added schedules.');
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
