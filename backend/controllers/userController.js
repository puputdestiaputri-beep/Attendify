const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id_user as id, nama as name, email, role FROM pengguna');
        res.json({ status: 'success', data: users });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query('SELECT id_user as id, nama as name, email, role FROM pengguna WHERE id_user = ?', [id]);
        if (users.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
        res.json({ status: 'success', data: users[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        
        await db.query(
            'UPDATE pengguna SET nama = ?, email = ?, role = ? WHERE id_user = ?',
            [name, email, role, id]
        );
        res.json({ status: 'success', message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM pengguna WHERE id_user = ?', [id]);
        res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
