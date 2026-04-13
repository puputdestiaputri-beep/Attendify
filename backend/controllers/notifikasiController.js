const db = require('../config/db');

exports.getNotifikasi = async (req, res) => {
    try {
        const [notif] = await db.query('SELECT * FROM notifikasi WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json({ status: 'success', data: notif });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createNotifikasi = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        await db.query(
            'INSERT INTO notifikasi (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [user_id, title, message, type || 'info']
        );
        res.status(201).json({ status: 'success', message: 'Notification created' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await db.query('UPDATE notifikasi SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [req.userId]);
        res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
