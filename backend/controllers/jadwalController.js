const db = require('../config/db');

exports.getAllJadwal = async (req, res) => {
    try {
        const [jadwal] = await db.query(`
            SELECT 
                jk.id_jadwal as id, 
                jk.hari, 
                jk.jam_mulai, 
                jk.jam_selesai, 
                jk.ruang,
                p.nama as dosen_name,
                mk.nama_mk as subject,
                k.nama_kelas as class_name,
                (SELECT COUNT(*) FROM absensi a WHERE a.jadwal_id = jk.id_jadwal AND DATE(a.tanggal) = CURDATE() AND a.status IN ('hadir', 'terlambat')) as attended_count,
                (SELECT COUNT(*) FROM mahasiswa_kelas mk_sub WHERE mk_sub.kelas_id = jk.kelas_id) as total_students
            FROM jadwal_kuliah jk
            JOIN pengguna p ON jk.dosen_id = p.id_user
            JOIN mata_kuliah mk ON jk.mata_kuliah_id = mk.id_mk
            JOIN kelas k ON jk.kelas_id = k.id_kelas
            ORDER BY FIELD(jk.hari, 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'), jk.jam_mulai
        `);
        res.json({ status: 'success', data: jadwal });
    } catch (err) {
        console.error('Error fetching jadwal:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createJadwal = async (req, res) => {
    try {
        const { mata_kuliah_id, dosen_id, kelas_id, ruangan, hari, jam_mulai, jam_selesai } = req.body;
        const [result] = await db.query(
            'INSERT INTO jadwal_kuliah (mata_kuliah_id, dosen_id, kelas_id, ruang, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [mata_kuliah_id, dosen_id, kelas_id, ruangan, hari, jam_mulai, jam_selesai]
        );
        res.status(201).json({ status: 'success', message: 'Jadwal created', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        const { mata_kuliah_id, dosen_id, kelas_id, ruangan, hari, jam_mulai, jam_selesai } = req.body;
        await db.query(
            'UPDATE jadwal_kuliah SET mata_kuliah_id=?, dosen_id=?, kelas_id=?, ruang=?, hari=?, jam_mulai=?, jam_selesai=? WHERE id_jadwal=?',
            [mata_kuliah_id, dosen_id, kelas_id, ruangan, hari, jam_mulai, jam_selesai, id]
        );
        res.json({ status: 'success', message: 'Jadwal updated' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.deleteJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM jadwal_kuliah WHERE id_jadwal = ?', [id]);
        res.json({ status: 'success', message: 'Jadwal deleted' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
