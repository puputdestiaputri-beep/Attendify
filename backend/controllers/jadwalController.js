const db = require('../config/db');

exports.getAllJadwal = async (req, res) => {
    try {
        const [jadwal] = await db.query(`
            SELECT j.*, d.nidn, u.name as dosen_name 
            FROM jadwal j 
            JOIN dosen d ON j.dosen_id = d.id 
            JOIN users u ON d.user_id = u.id
        `);
        res.json({ status: 'success', data: jadwal });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.createJadwal = async (req, res) => {
    try {
        const { mata_kuliah, dosen_id, ruangan, hari, jam_mulai, jam_selesai } = req.body;
        const [result] = await db.query(
            'INSERT INTO jadwal (mata_kuliah, dosen_id, ruangan, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?)',
            [mata_kuliah, dosen_id, ruangan, hari, jam_mulai, jam_selesai]
        );
        res.status(201).json({ status: 'success', message: 'Jadwal created', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        const { mata_kuliah, dosen_id, ruangan, hari, jam_mulai, jam_selesai } = req.body;
        await db.query(
            'UPDATE jadwal SET mata_kuliah=?, dosen_id=?, ruangan=?, hari=?, jam_mulai=?, jam_selesai=? WHERE id=?',
            [mata_kuliah, dosen_id, ruangan, hari, jam_mulai, jam_selesai, id]
        );
        res.json({ status: 'success', message: 'Jadwal updated' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.deleteJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM jadwal WHERE id = ?', [id]);
        res.json({ status: 'success', message: 'Jadwal deleted' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
