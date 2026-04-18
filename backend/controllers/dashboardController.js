const db = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
    try {
        const [usersCount] = await db.query('SELECT COUNT(*) as total FROM users');
        const [absensiCount] = await db.query('SELECT COUNT(*) as total FROM absensi WHERE DATE(waktu_absen) = CURDATE()');
        res.json({
            status: 'success',
            data: {
                total_users: usersCount[0].total,
                total_absensi_hari_ini: absensiCount[0].total
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getDosenDashboard = async (req, res) => {
    try {
        // Need to join user -> dosen -> jadwal -> kelas -> absensi
        // Assuming req.userId is mapped to dosen
        const [dosen] = await db.query('SELECT id FROM dosen WHERE user_id = ?', [req.userId]);
        if (dosen.length === 0) return res.status(403).json({ status: 'error', message: 'User is not a dosen' });

        const dosen_id = dosen[0].id;
        const [jadwal] = await db.query('SELECT * FROM jadwal WHERE dosen_id = ?', [dosen_id]);

        res.json({
            status: 'success',
            data: {
                jadwal_mengajar: jadwal,
                absensi_stats: "Dummy stats, query according to each jadwal id"
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getMahasiswaDashboard = async (req, res) => {
    try {
        const [mhs] = await db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [req.userId]);
        if (mhs.length === 0) return res.status(403).json({ status: 'error', message: 'User is not a mahasiswa' });

        const mhs_id = mhs[0].id;
        const [riwayat] = await db.query('SELECT * FROM absensi WHERE mahasiswa_id = ? ORDER BY waktu_absen DESC LIMIT 5', [mhs_id]);

        res.json({
            status: 'success',
            data: {
                riwayat_absensi_terakhir: riwayat
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
