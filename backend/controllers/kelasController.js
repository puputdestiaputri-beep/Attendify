const db = require('../config/db');

exports.getAllKelas = async (req, res) => {
    try {
        const [kelas] = await db.query('SELECT * FROM kelas ORDER BY nama_kelas ASC');
        res.json({ status: 'success', data: kelas });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getKelasById = async (req, res) => {
    try {
        const { id } = req.params;
        const [kelas] = await db.query('SELECT * FROM kelas WHERE id_kelas = ?', [id]);
        if (kelas.length === 0) return res.status(404).json({ status: 'error', message: 'Kelas not found' });
        res.json({ status: 'success', data: kelas[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
