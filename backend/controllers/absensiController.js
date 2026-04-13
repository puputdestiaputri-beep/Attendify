const db = require('../config/db');

// Core API specifically for ESP32
exports.scanWajah = async (req, res) => {
    try {
        // ESP32 sends: device_id, image (base64), timestamp
        // And optionally user_id if it recognized it natively.
        // For simulation purposes, we will assume ESP32 payload might include matched "user_id"
        // or we mock the matching process.
        
        const { device_id, image, timestamp, user_id } = req.body;

        if (!device_id || !image) {
            return res.status(400).json({ status: 'error', message: 'device_id and image are required' });
        }

        // Mocking Face Recognition Processing
        // Normally, you would pass the 'image' (base64) to a python script or a C++ addon.
        // Here, if user_id is provided, we assume matched, otherwise we mock a match.
        let matchedUserId = user_id || 1; // Assuming it matches user ID 1 for simulation

        // Find mahasiswa using user_id
        const [mahasiswa] = await db.query('SELECT m.id, u.name FROM mahasiswa m JOIN users u ON m.user_id = u.id WHERE u.id = ?', [matchedUserId]);
        
        if (mahasiswa.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Mahasiswa not found for this face' });
        }

        const mhs_id = mahasiswa[0].id;
        const mhs_name = mahasiswa[0].name;

        // Mock Jadwal Logic (Find the ongoing jadwal for this ruangan/device)
        const [jadwalActive] = await db.query(
            'SELECT id, jam_mulai FROM jadwal WHERE CURRENT_TIME() BETWEEN jam_mulai AND jam_selesai LIMIT 1'
        );

        if (jadwalActive.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Tidak ada jadwal kuliah aktif saat ini' });
        }

        const activeJadwalId = jadwalActive[0].id;

        // NEW: Check if already scanned today for this jadwal
        const [existing] = await db.query(
            'SELECT id FROM absensi WHERE mahasiswa_id = ? AND jadwal_id = ? AND DATE(waktu_absen) = CURDATE()',
            [mhs_id, activeJadwalId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ status: 'success', message: 'Anda sudah melakukan absensi hari ini' });
        }

        const jam_mulai = new Date('1970-01-01T' + jadwalActive[0].jam_mulai + 'Z');
        const waktuAbsenTime = new Date('1970-01-01T' + new Date().toTimeString().split(' ')[0] + 'Z');
        
        let statusAbsen = 'hadir';
        if (waktuAbsenTime > new Date(jam_mulai.getTime() + 15*60000)) { // Late if > 15 mins
            statusAbsen = 'telat';
        }

        // Insert Absensi
        await db.query(
            'INSERT INTO absensi (mahasiswa_id, jadwal_id, waktu_absen, status, confidence_score, device_id) VALUES (?, ?, NOW(), ?, ?, ?)',
            [mhs_id, activeJadwalId, statusAbsen, 99.50, device_id]
        );

        // Auto Notification Logic
        let notifMsg = '';
        let notifType = 'success';
        if (statusAbsen === 'hadir') {
            notifMsg = 'Absensi berhasil: Hadir tepat waktu ✅';
        } else {
            notifMsg = 'Absensi berhasil: Anda terlambat ⚠️';
            notifType = 'warning';
        }

        await db.query(
            'INSERT INTO notifikasi (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [matchedUserId, 'Informasi Absensi', notifMsg, notifType]
        );

        await db.query(
            'INSERT INTO logs (user_id, activity) VALUES (?, ?)',
            [matchedUserId, 'Melakukan scan wajah via '+device_id]
        );

        const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

        res.json({
            status: 'success',
            message: 'Absensi berhasil',
            data: {
                nama: mhs_name,
                status: statusAbsen,
                waktu: timeStr
            }
        });

    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Finish Class Trigger - Marks non-scanned students as 'alfa'
exports.finishClass = async (req, res) => {
    try {
        const { jadwal_id } = req.body;
        if (!jadwal_id) return res.status(400).json({ status: 'error', message: 'jadwal_id is required' });

        // 1. Get all students listed in classes for this schedule
        const [studentsInClass] = await db.query(`
            SELECT km.mahasiswa_id, m.user_id 
            FROM kelas_mahasiswa km
            JOIN kelas k ON km.kelas_id = k.id
            JOIN mahasiswa m ON km.mahasiswa_id = m.id
            WHERE k.jadwal_id = ?
        `, [jadwal_id]);

        let alfaCount = 0;
        for (let s of studentsInClass) {
            // Check if student has attendance record for today and this schedule
            const [attendance] = await db.query(
                'SELECT id FROM absensi WHERE mahasiswa_id = ? AND jadwal_id = ? AND DATE(waktu_absen) = CURDATE()',
                [s.mahasiswa_id, jadwal_id]
            );

            if (attendance.length === 0) {
                // Not present -> Mark as ALFA
                await db.query(
                    'INSERT INTO absensi (mahasiswa_id, jadwal_id, waktu_absen, status) VALUES (?, ?, NOW(), ?)',
                    [s.mahasiswa_id, jadwal_id, 'alfa']
                );

                // Send ❌ Notification
                await db.query(
                    'INSERT INTO notifikasi (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                    [s.user_id, 'Absensi Alfa', 'Anda tidak hadir dalam perkuliahan hari ini ❌', 'error']
                );
                alfaCount++;
            }
        }

        res.json({ 
            status: 'success', 
            message: `Kelas selesai. ${alfaCount} mahasiswa ditandai tidak hadir (alfa).` 
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getAllAbsensi = async (req, res) => {
    try {
        const [absensi] = await db.query(`
            SELECT a.*, u.name, m.npm, j.mata_kuliah 
            FROM absensi a 
            JOIN mahasiswa m ON a.mahasiswa_id = m.id 
            JOIN users u ON m.user_id = u.id
            JOIN jadwal j ON a.jadwal_id = j.id
            ORDER BY a.waktu_absen DESC
        `);
        res.json({ status: 'success', data: absensi });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getAbsensiByMahasiswa = async (req, res) => {
    try {
        const { mahasiswa_id } = req.params;
        const [absensi] = await db.query(`
            SELECT a.*, j.mata_kuliah 
            FROM absensi a 
            JOIN jadwal j ON a.jadwal_id = j.id 
            WHERE a.mahasiswa_id = ?
            ORDER BY a.waktu_absen DESC
        `, [mahasiswa_id]);
        res.json({ status: 'success', data: absensi });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
