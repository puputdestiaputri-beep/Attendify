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
    if (classId) {
        query += " AND k.id_kelas = ?";
        params.push(classId);
    }
    if (jadwalId) {
        query += " AND jk.id_jadwal = ?";
        params.push(jadwalId);
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
        const { class_id, jadwal_id, date } = req.query;
        const data = await getAttendanceData(class_id, date, jadwal_id);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Tidak ada data absensi' });
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Absensi');
        
        // Header info
        const firstData = data[0];
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `LAPORAN ABSENSI - ${firstData.subject}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'center' };
        
        worksheet.mergeCells('A2:H2');
        const classCell = worksheet.getCell('A2');
        classCell.value = `Kelas: ${firstData.class_name} | Dosen: ${firstData.dosen_name} | Ruangan: ${firstData.ruang}`;
        classCell.font = { size: 11 };
        classCell.alignment = { horizontal: 'center', vertical: 'center' };
        
        worksheet.addRow([]);
        
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama Mahasiswa', key: 'name', width: 25 },
            { header: 'NIM', key: 'nim', width: 12 },
            { header: 'Tanggal', key: 'date', width: 12 },
            { header: 'Waktu Datang', key: 'time', width: 12 },
            { header: 'Status', key: 'status', width: 12 }
        ];
        
        // Remove default header row and add custom header at row 4
        worksheet.getRow(4).values = ['No', 'Nama Mahasiswa', 'NIM', 'Tanggal', 'Waktu Datang', 'Status'];
        worksheet.getRow(4).font = { bold: true };
        worksheet.getRow(4).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        
        // Add data
        let rowNum = 5;
        data.forEach((row, index) => {
            worksheet.getRow(rowNum).values = {
                no: index + 1,
                name: row.name,
                nim: row.nim,
                date: new Date(row.tanggal).toLocaleDateString('id-ID'),
                time: row.time || '-',
                status: row.status.toUpperCase()
            };
            
            // Color status based on value
            const statusCell = worksheet.getRow(rowNum).getCell(6);
            if (row.status === 'hadir') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            } else if (row.status === 'terlambat') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
            } else if (row.status === 'sakit' || row.status === 'izin') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
            } else {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
            }
            rowNum++;
        });
        
        const filename = `Laporan_${firstData.subject.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (err) {
        console.error('Excel Export Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.exportPDF = async (req, res) => {
    try {
        const { class_id, jadwal_id, date } = req.query;
        const data = await getAttendanceData(class_id, date, jadwal_id);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Tidak ada data absensi' });
        }
        
        const firstData = data[0];
        
        const content = [
            { text: 'LAPORAN KEHADIRAN MAHASISWA', style: 'header' },
            { text: `Mata Kuliah: ${firstData.subject}`, style: 'info' },
            { text: `Kelas: ${firstData.class_name} | Dosen: ${firstData.dosen_name}`, style: 'info' },
            { text: `Ruangan: ${firstData.ruang}`, style: 'info' },
            { text: `Periode: ${date || 'Semua Data'}`, style: 'info' },
            { text: '\n' }
        ];
        
        // Group by status for summary
        const statusGroups = {
            hadir: data.filter(d => d.status === 'hadir'),
            terlambat: data.filter(d => d.status === 'terlambat'),
            sakit: data.filter(d => d.status === 'sakit'),
            izin: data.filter(d => d.status === 'izin'),
            alfa: data.filter(d => d.status === 'alfa')
        };
        
        // Summary section
        content.push({
            table: {
                widths: ['*', '*', '*', '*', '*'],
                body: [
                    ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alfa'],
                    [
                        statusGroups.hadir.length.toString(),
                        statusGroups.terlambat.length.toString(),
                        statusGroups.sakit.length.toString(),
                        statusGroups.izin.length.toString(),
                        statusGroups.alfa.length.toString()
                    ]
                ]
            },
            margin: [0, 0, 0, 20]
        });
        
        content.push({ text: 'DETAIL KEHADIRAN', style: 'sectionHeader' });
        
        const body = [
            ['No', 'Nama Mahasiswa', 'NIM', 'Tanggal', 'Waktu', 'Status']
        ];
        
        data.forEach((row, index) => {
            body.push([
                (index + 1).toString(),
                row.name,
                row.nim,
                new Date(row.tanggal).toLocaleDateString('id-ID'),
                row.time || '-',
                row.status.toUpperCase()
            ]);
        });
        
        content.push({
            table: {
                headerRows: 1,
                widths: [20, '*', 60, 70, 50, 55],
                body: body
            },
            margin: [0, 0, 0, 20]
        });
        
        const docDefinition = {
            content: content,
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    alignment: 'center',
                    color: '#2563EB'
                },
                info: {
                    fontSize: 11,
                    margin: [0, 0, 0, 2],
                    alignment: 'center',
                    color: '#1E293B'
                },
                sectionHeader: {
                    fontSize: 13,
                    bold: true,
                    margin: [0, 15, 0, 10],
                    color: '#1E293B',
                    decoration: 'underline'
                }
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            pageMargins: [40, 40, 40, 40]
        };
        
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        
        const filename = `Laporan_${firstData.subject.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
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
