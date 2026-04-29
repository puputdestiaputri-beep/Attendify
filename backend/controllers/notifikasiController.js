const db = require('../config/db');

exports.getNotifikasi = async (req, res) => {
    try {
        const [notif] = await db.query(
            'SELECT id_notif as id, judul as title, pesan as message, tanggal as time, jenis_notif as type, status_baca as status FROM notifikasi WHERE user_id = ? ORDER BY tanggal DESC', 
            [req.userId]
        );
        
        // Map backend schema to frontend expected format
        const formattedNotif = notif.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: n.time,
            type: n.type === 'absensi' ? 'success' : n.type === 'terlambat' ? 'warning' : 'info',
            read: n.status === 'sudah'
        }));

        res.json({ status: 'success', data: formattedNotif });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createNotifikasi = async (req, res) => {
    try {
        let { user_id, title, message, type } = req.body;
        
        // If user_id is 1 (default from frontend) or missing, find the first admin
        if (!user_id || user_id === 1) {
            const [admins] = await db.query('SELECT id_user FROM pengguna WHERE role = "admin" LIMIT 1');
            if (admins.length > 0) {
                user_id = admins[0].id_user;
            } else {
                // Fallback to 1 if no admin found (to avoid crash)
                user_id = 1;
            }
        }

        // type should be 'absensi', 'terlambat', or 'informasi' according to ENUM
        const validTypes = ['absensi', 'terlambat', 'informasi'];
        const jenis_notif = validTypes.includes(type) ? type : 'informasi';

        await db.query(
            'INSERT INTO notifikasi (user_id, judul, pesan, jenis_notif, tanggal, status_baca) VALUES (?, ?, ?, ?, NOW(), ?)',
            [user_id, title, message, jenis_notif, 'belum']
        );
        res.status(201).json({ status: 'success', message: 'Notification created and sent to admin' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id_notif } = req.body;
        if (id_notif) {
            await db.query('UPDATE notifikasi SET status_baca = "sudah" WHERE id_notif = ? AND user_id = ?', [id_notif, req.userId]);
        } else {
            await db.query('UPDATE notifikasi SET status_baca = "sudah" WHERE user_id = ? AND status_baca = "belum"', [req.userId]);
        }
        res.json({ status: 'success', message: 'Notifications updated' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
