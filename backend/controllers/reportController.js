const db = require('../config/db');

exports.exportAttendance = async (req, res) => {
    try {
        const [absensi] = await db.query(`
            SELECT a.id, u.name, m.npm, j.mata_kuliah, a.waktu_absen, a.status, a.device_id
            FROM absensi a 
            JOIN mahasiswa m ON a.mahasiswa_id = m.id 
            JOIN users u ON m.user_id = u.id
            JOIN jadwal j ON a.jadwal_id = j.id
            ORDER BY a.waktu_absen DESC
        `);

        // Create CSV Content
        let csvContent = "ID,Nama Mahasiswa,NPM,Mata Kuliah,Waktu Absen,Status,Device ID\n";
        
        absensi.forEach((row) => {
            const waktu = row.waktu_absen ? new Date(row.waktu_absen).toLocaleString('id-ID') : '-';
            csvContent += `${row.id},"${row.name}","${row.npm}","${row.mata_kuliah}","${waktu}","${row.status}","${row.device_id || '-'}"\n`;
        });

        // Set response headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=laporan_absensi.csv');
        
        return res.status(200).send(csvContent);

    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
