const db = require('../config/db');
const ExcelJS = require('exceljs');
const PdfPrinter = require('pdfmake/js/printer').default;
const path = require('path');

// Configure fonts for pdfmake
const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};
const printer = new PdfPrinter(fonts);

/**
 * Common query for reports
 */
const getAttendanceData = async (classId, date) => {
    let query = `
        SELECT 
            a.id_absensi, 
            p.nama as name, 
            p.username as nim, 
            mk.nama_mk as subject, 
            k.nama_kelas as class_name,
            a.tanggal, 
            a.waktu_datang as time, 
            a.status
        FROM absensi a
        JOIN pengguna p ON a.user_id = p.id_user
        JOIN jadwal_kuliah jk ON a.jadwal_id = jk.id_jadwal
        JOIN mata_kuliah mk ON jk.mata_kuliah_id = mk.id_mk
        JOIN kelas k ON jk.kelas_id = k.id_kelas
        WHERE 1=1
    `;
    
    const params = [];
    if (classId) {
        query += " AND k.id_kelas = ?";
        params.push(classId);
    }
    if (date) {
        query += " AND DATE(a.tanggal) = ?";
        params.push(date);
    }
    
    query += " ORDER BY k.nama_kelas ASC, a.tanggal DESC, a.waktu_datang DESC";
    
    const [rows] = await db.query(query, params);
    return rows;
};

exports.exportExcel = async (req, res) => {
    try {
        const { class_id, date } = req.query;
        const data = await getAttendanceData(class_id, date);
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');
        
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Kelas', key: 'class_name', width: 15 },
            { header: 'Nama Mahasiswa', key: 'name', width: 25 },
            { header: 'NIM', key: 'nim', width: 12 },
            { header: 'Mata Kuliah', key: 'subject', width: 25 },
            { header: 'Tanggal', key: 'date', width: 12 },
            { header: 'Waktu', key: 'time', width: 10 },
            { header: 'Status', key: 'status', width: 12 }
        ];
        
        data.forEach((row, index) => {
            worksheet.addRow({
                no: index + 1,
                class_name: row.class_name,
                name: row.name,
                nim: row.nim,
                subject: row.subject,
                date: new Date(row.tanggal).toLocaleDateString('id-ID'),
                time: row.time || '-',
                status: row.status.toUpperCase()
            });
        });
        
        // Styling header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=laporan_absensi.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (err) {
        console.error('Excel Export Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.exportPDF = async (req, res) => {
    try {
        const { class_id, date } = req.query;
        const data = await getAttendanceData(class_id, date);
        
        // Group data by class for the PDF
        const groupedData = data.reduce((acc, row) => {
            if (!acc[row.class_name]) acc[row.class_name] = [];
            acc[row.class_name].push(row);
            return acc;
        }, {});

        const content = [
            { text: 'LAPORAN KEHADIRAN MAHASISWA', style: 'header' },
            { text: `Periode: ${date || 'Semua Data'}`, style: 'subheader' },
            { text: '\n' }
        ];

        Object.keys(groupedData).forEach((className) => {
            content.push({ text: `KELAS: ${className}`, style: 'classHeader' });
            
            const body = [
                ['No', 'Nama Mahasiswa', 'NIM', 'Matkul', 'Waktu', 'Status']
            ];
            
            groupedData[className].forEach((row, index) => {
                body.push([
                    (index + 1).toString(),
                    row.name,
                    row.nim,
                    row.subject,
                    row.time || '-',
                    row.status.toUpperCase()
                ]);
            });

            content.push({
                table: {
                    headerRows: 1,
                    widths: [20, '*', 60, 100, 45, 55],
                    body: body
                },
                margin: [0, 0, 0, 20]
            });
        });
        
        const docDefinition = {
            content: content,
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    alignment: 'center',
                    color: '#2563EB'
                },
                subheader: {
                    fontSize: 12,
                    margin: [0, 0, 0, 15],
                    alignment: 'center',
                    color: '#64748B'
                },
                classHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 10],
                    color: '#1E293B',
                    decoration: 'underline'
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
        
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=laporan_absensi_${className || 'all'}.pdf`);
        
        pdfDoc.pipe(res);
        pdfDoc.end();
        
    } catch (err) {
        console.error('PDF Export Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.exportAttendance = async (req, res) => {
    return this.exportExcel(req, res);
};
