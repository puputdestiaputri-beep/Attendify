const db = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
    try {
        const [usersCount] = await db.query('SELECT COUNT(*) as total FROM pengguna');
        const [dosenCount] = await db.query('SELECT COUNT(*) as total FROM pengguna WHERE role = "dosen"');
        const [absensiCount] = await db.query('SELECT COUNT(*) as total FROM absensi WHERE DATE(tanggal) = CURDATE()');
        
        res.json({
            status: 'success',
            data: {
                total_users: usersCount[0].total,
                total_dosen: dosenCount[0].total,
                total_absensi_hari_ini: absensiCount[0].total
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getDosenDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        // Get schedules for this lecturer
        const [jadwal] = await db.query(`
            SELECT jk.*, mk.nama_mk, k.nama_kelas
            FROM jadwal_kuliah jk
            JOIN mata_kuliah mk ON jk.mata_kuliah_id = mk.id_mk
            JOIN kelas k ON jk.kelas_id = k.id_kelas
            WHERE jk.dosen_id = ?
        `, [userId]);

        res.json({
            status: 'success',
            data: {
                jadwal_mengajar: jadwal
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getMahasiswaDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const [riwayat] = await db.query(`
            SELECT a.*, mk.nama_mk
            FROM absensi a 
            JOIN jadwal_kuliah jk ON a.jadwal_id = jk.id_jadwal
            JOIN mata_kuliah mk ON jk.mata_kuliah_id = mk.id_mk
            WHERE a.user_id = ? 
            ORDER BY a.tanggal DESC LIMIT 5
        `, [userId]);

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
