const db = require('../config/db');

/**
 * Get all detection logs
 */
exports.getAllLogs = async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT 
                l.id_log, 
                l.waktu_deteksi, 
                l.confidence, 
                l.foto_capture,
                p.nama as user_name,
                p.role as user_role,
                k.nama_kamera,
                k.lokasi_kelas as camera_location
            FROM log_deteksi l
            LEFT JOIN pengguna p ON l.user_id = p.id_user
            LEFT JOIN kamera k ON l.kamera_id = k.id_kamera
            ORDER BY l.waktu_deteksi DESC
            LIMIT 100
        `);

        res.json({
            status: 'success',
            data: logs
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Gagal mengambil log database',
            error: err.message 
        });
    }
};

/**
 * Get summary stats for logs (optional, for dashboard)
 */
exports.getLogStats = async (req, res) => {
    try {
        const [todayCount] = await db.query('SELECT COUNT(*) as total FROM log_deteksi WHERE DATE(waktu_deteksi) = CURDATE()');
        const [totalCount] = await db.query('SELECT COUNT(*) as total FROM log_deteksi');
        
        res.json({
            status: 'success',
            data: {
                today: todayCount[0].total,
                total: totalCount[0].total
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
