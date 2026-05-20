const db = require('../config/db');

exports.getNotifikasi = async (req, res) => {
    try {
        const [notif] = await db.query(
            'SELECT id, title, message, created_at as time, type, is_read FROM notifications WHERE receiver_user_id = ? ORDER BY created_at DESC', 
            [req.userId]
        );
        
        // Map backend schema to frontend expected format
        const formattedNotif = notif.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: n.time,
            type: n.type, // types: NEW_REPORT, ATTENDANCE_SUCCESS, DAILY_REPORT, REPORT_STATUS_UPDATE, ATTENDANCE_VALIDATION
            read: n.is_read === 1
        }));

        res.json({ status: 'success', data: formattedNotif });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createNotifikasi = async (req, res) => {
    try {
        let { receiver_user_id, title, message, type } = req.body;
        
        // If receiver_user_id is missing, fallback to admin
        if (!receiver_user_id) {
            const [admins] = await db.query('SELECT id_user FROM pengguna WHERE role = "admin" LIMIT 1');
            if (admins.length > 0) {
                receiver_user_id = admins[0].id_user;
            } else {
                receiver_user_id = 1;
            }
        }

        await db.query(
            'INSERT INTO notifications (receiver_user_id, sender_user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, FALSE)',
            [receiver_user_id, req.userId || null, title, message, type || 'INFO']
        );
        res.status(201).json({ status: 'success', message: 'Notification created' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id_notif } = req.body; // The frontend currently sends id_notif
        if (id_notif) {
            await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND receiver_user_id = ?', [id_notif, req.userId]);
        } else {
            await db.query('UPDATE notifications SET is_read = TRUE WHERE receiver_user_id = ? AND is_read = FALSE', [req.userId]);
        }
        res.json({ status: 'success', message: 'Notifications updated' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
