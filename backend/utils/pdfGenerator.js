const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateAbsensiPDF(listMahasiswa, namaMk, tanggal, namaFile) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(namaFile);
        
        doc.pipe(stream);

        // Judul
        doc.fontSize(20).text('Laporan Absensi Mahasiswa', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Mata Kuliah : ${namaMk}`);
        doc.text(`Tanggal       : ${tanggal}`);
        doc.moveDown();

        // Header Tabel
        doc.rect(50, 150, 500, 30).fill('#eeeeee').stroke();
        doc.fillColor('black').fontSize(12).text('No', 60, 158);
        doc.text('Nama Mahasiswa', 120, 158);
        doc.text('Status', 450, 158);

        // Isi Data
        let y = 200;
        listMahasiswa.forEach((mhs, index) => {
            doc.fontSize(10).text(index + 1, 60, y);
            doc.text(mhs.nama, 120, y);
            doc.text(mhs.status, 450, y);
            y += 25; // Jarak antar baris
        });

        doc.end();
        stream.on('finish', () => resolve(namaFile));
        stream.on('error', reject);
    });
}

module.exports = { generateAbsensiPDF };