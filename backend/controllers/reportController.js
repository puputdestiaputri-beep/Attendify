const db = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// ======================================================
// COMMON QUERY (DIPERBAIKI)
// ======================================================
const getAttendanceData = async (classId, date, jadwalId) => {
    let query = `
        SELECT 
            a.id_absensi, 
            p.nama as name, 
            p.username as nim, 
            mk.nama_mk as subject, 
            k.nama_kelas as class_name,
            d.nama as dosen_name,
            jk.ruang,
            a.tanggal, 
            a.waktu_datang as time, 
            a.status
        FROM absensi a
        JOIN pengguna p ON a.user_id = p.id_user
        JOIN jadwal_kuliah jk ON a.jadwal_id = jk.id_jadwal
        JOIN mata_kuliah mk ON jk.mata_kuliah_id = mk.id_mk
        JOIN kelas k ON jk.kelas_id = k.id_kelas
        JOIN pengguna d ON jk.dosen_id = d.id_user
        WHERE 1=1
    `;

    const params = [];

    // Filter berdasarkan Jadwal ID (Paling Akurat)
    if (jadwalId && jadwalId !== 'null' && jadwalId !== 'undefined') {
        query += " AND jk.id_jadwal = ?";
        params.push(jadwalId);
    }

    if (classId) {
        query += " AND k.id_kelas = ?";
        params.push(classId);
    }

    if (date) {
        query += " AND DATE(a.tanggal) = ?";
        params.push(date);
    }

    query += " ORDER BY a.waktu_datang ASC";

    const [rows] = await db.query(query, params);
    return rows;
};

// ======================================================
// EXPORT PDF (LAYOUT DIPERBAIKI BIAR RAPI)
// ======================================================
exports.exportPDF = async (req, res) => {
    try {
        const { class_id, jadwal_id, date } = req.query;

        const data = await getAttendanceData(class_id, date, jadwal_id);

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Tidak ada data absensi untuk sesi ini.'
            });
        }

        const firstData = data[0];
        const filename = `Laporan_Absensi_${firstData.subject.replace(/\s+/g, '_')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        // Header Instansi (Opsional, biar keren)
        doc.fontSize(16).text('ATTENDIFY - SISTEM ABSENSI WAJAH', { align: 'center', bullet: true });
        doc.fontSize(10).text('Laporan Kehadiran Mahasiswa Otomatis', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(); // Garis Horizontal
        doc.moveDown();

        // Info Matkul
        doc.fontSize(11).font('Helvetica-Bold').text(`Mata Kuliah : `, { continued: true }).font('Helvetica').text(firstData.subject);
        doc.font('Helvetica-Bold').text(`Dosen       : `, { continued: true }).font('Helvetica').text(firstData.dosen_name);
        doc.font('Helvetica-Bold').text(`Kelas/Ruang : `, { continued: true }).font('Helvetica').text(`${firstData.class_name} / ${firstData.ruang}`);
        doc.font('Helvetica-Bold').text(`Tanggal     : `, { continued: true }).font('Helvetica').text(new Date(firstData.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' }));
        doc.moveDown(2);

        // TABLE HEADER (Pakai koordinat X biar lurus)
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('No', 50, tableTop);
        doc.text('NIM', 80, tableTop);
        doc.text('Nama Mahasiswa', 180, tableTop);
        doc.text('Jam', 380, tableTop);
        doc.text('Status', 480, tableTop);
        
        doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
        doc.font('Helvetica').moveDown();

        // TABLE ROWS
        let currentY = tableTop + 25;
        data.forEach((item, index) => {
            // Cek jika halaman penuh
            if (currentY > 750) {
                doc.addPage();
                currentY = 50; 
            }

            doc.text(index + 1, 50, currentY);
            doc.text(item.nim, 80, currentY);
            doc.text(item.name, 180, currentY, { width: 190 });
            doc.text(item.time || '--:--', 380, currentY);
            
            // Warna Status (Hijau untuk Hadir)
            if (item.status.toUpperCase() === 'HADIR') {
                doc.fillColor('green').text(item.status.toUpperCase(), 480, currentY).fillColor('black');
            } else {
                doc.fillColor('red').text(item.status.toUpperCase(), 480, currentY).fillColor('black');
            }

            currentY += 20;
        });

        doc.moveTo(50, currentY).lineTo(545, currentY).stroke();
        doc.moveDown();
        doc.fontSize(10).font('Helvetica-Oblique').text(`Total Kehadiran: ${data.length} Mahasiswa`, { align: 'right' });

        doc.end();

    } catch (err) {
        console.error('PDF Export Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ======================================================
// EXPORT EXCEL & OTHER
// ======================================================
exports.exportExcel = async (req, res) => {
    
};

exports.exportAttendance = async (req, res) => {
    return this.exportExcel(req, res);
};

exports.createReport = async (req, res) => {
    
};

exports.getAdminReports = async (req, res) => {
    
};

exports.updateReportStatus = async (req, res) => {

};