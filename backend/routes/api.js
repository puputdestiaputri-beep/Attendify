const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const faceService = require('../services/faceService');

// ======================================================
// MIDDLEWARE
// ======================================================
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ======================================================
// CONTROLLERS
// ======================================================
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const jadwalCtrl = require('../controllers/jadwalController');
const absensiCtrl = require('../controllers/absensiController');
const notifCtrl = require('../controllers/notifikasiController');
const dashCtrl = require('../controllers/dashboardController');
const reportCtrl = require('../controllers/reportController');
const wajahCtrl = require('../controllers/wajahController');
const logCtrl = require('../controllers/logController');
const kelasCtrl = require('../controllers/kelasController');
const iotCtrl = require('../controllers/iotController');
const manualScanCtrl = require('../controllers/manualScanController');

// ======================================================
// 1. AUTH ROUTES
// ======================================================
router.post('/register', authCtrl.register);
router.post('/register/admin-dosen', auth, roleCheck('admin'), authCtrl.registerAdminOrDosen);
router.post('/login', authCtrl.login);
router.get('/profile', auth, authCtrl.getProfile);
router.post('/profile/avatar', auth, authCtrl.uploadAvatar);
router.put('/profile/update', auth, authCtrl.updateProfile);

// ======================================================
// 2. USER ROUTES
// ======================================================
router.get('/users', auth, userCtrl.getAllUsers);
router.get('/users/:id', auth, userCtrl.getUserById);
router.put('/users/:id', auth, roleCheck('admin'), userCtrl.updateUser);
router.delete('/users/:id', auth, roleCheck('admin'), userCtrl.deleteUser);

// ======================================================
// 3. JADWAL ROUTES
// ======================================================
router.get('/jadwal', jadwalCtrl.getAllJadwal);

// ======================================================
// 4. ABSENSI ROUTES
// ======================================================
router.post('/absensi/scan', absensiCtrl.scanWajah);
router.post('/trigger-scan', absensiCtrl.triggerScan);
router.post('/absensi/finish', auth, roleCheck('dosen', 'admin'), absensiCtrl.finishClass);
router.get('/absensi', auth, absensiCtrl.getAllAbsensi);
router.get('/absensi/:mahasiswa_id', auth, absensiCtrl.getAbsensiByMahasiswa);
router.post('/absensi/update', auth, roleCheck('dosen', 'admin'), absensiCtrl.updateAttendanceStatus);
router.get('/admin/attendance', auth, roleCheck('admin'), absensiCtrl.getAdminAttendance);

// ======================================================
// 5. REPORT ROUTES (PDF & EXCEL)
// ======================================================
router.get('/reports/absensi', auth, roleCheck('admin', 'dosen'), reportCtrl.exportAttendance);
router.get('/reports/excel', reportCtrl.exportExcel);
router.get('/reports/pdf', reportCtrl.exportPDF);
router.post('/reports', auth, reportCtrl.createReport);
router.get('/admin/reports', auth, roleCheck('admin'), reportCtrl.getAdminReports);
router.put('/admin/reports/:id/status', auth, roleCheck('admin'), reportCtrl.updateReportStatus);

// ======================================================
// 6. NOTIFIKASI & DASHBOARD
// ======================================================
router.get('/notifikasi', auth, notifCtrl.getNotifikasi);
router.post('/notifikasi', auth, roleCheck('admin', 'dosen', 'mahasiswa'), notifCtrl.createNotifikasi);
router.put('/notifikasi/read', auth, notifCtrl.markAsRead);

router.get('/dashboard/admin', auth, roleCheck('admin'), dashCtrl.getAdminDashboard);
router.get('/dashboard/dosen', auth, roleCheck('dosen'), dashCtrl.getDosenDashboard);
router.get('/dashboard/mahasiswa', auth, roleCheck('mahasiswa'), dashCtrl.getMahasiswaDashboard);

// ======================================================
// 7. WAJAH & VALIDATION
// ======================================================
router.get('/wajah/available-users', auth, roleCheck('admin'), wajahCtrl.getAvailableUsers);
router.post('/wajah/start-session', auth, roleCheck('admin'), wajahCtrl.startValidationSession);
router.get('/wajah/status/:user_id', auth, wajahCtrl.getValidationStatus);
router.post('/wajah/iot-capture', wajahCtrl.uploadIotFaceData);

// ======================================================
// 8. SYSTEM LOGS & KELAS
// ======================================================
router.get('/logs', auth, roleCheck('admin'), logCtrl.getAllLogs);
router.get('/logs/stats', auth, roleCheck('admin'), logCtrl.getLogStats);
router.get('/logs/recent', logCtrl.getRecentLogs);

router.get('/kelas', auth, kelasCtrl.getAllKelas);
router.get('/kelas/:id', auth, kelasCtrl.getKelasById);
router.get('/kelas/:id/mahasiswa', kelasCtrl.getMahasiswaByKelas);

// ======================================================
// 9. IoT / ESP32 CORE LOGIC (REAL AI RECOGNITION)
// ======================================================
router.post('/iot/recognize', async (req, res) => {
  try {
    console.log("ESP32 DATA Received for Recognition");
    const { device_id, image } = req.body;

    if (!device_id || !image) {
      return res.status(400).json({ success: false, message: "Missing device_id or image" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const [registeredUsers] = await db.query(
      'SELECT id_user as user_id, face_descriptor FROM pengguna WHERE face_descriptor IS NOT NULL'
    );

    const matchResult = await faceService.recognizeFace(buffer, registeredUsers);

    if (!matchResult.success) {
      return res.status(401).json({ success: false, recognized: false, message: matchResult.message || "Face not recognized" });
    }

    const matchedUserId = matchResult.user_id;
    const [users] = await db.query(
      `SELECT p.id_user as user_id, p.nama as name, IFNULL(k.nama_kelas, '-') as kelas 
       FROM pengguna p 
       LEFT JOIN mahasiswa_kelas mk ON p.id_user = mk.mahasiswa_id 
       LEFT JOIN kelas k ON mk.kelas_id = k.id_kelas 
       WHERE p.id_user = ?`,
      [matchedUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User found by AI but missing in database" });
    }

    const user = users[0];
    const filename = `attendance_${user.user_id}_${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, '..', 'uploads', filename);
    fs.writeFileSync(uploadPath, buffer);

    await db.query(
      'INSERT INTO attendance (user_id, name, kelas, photo) VALUES (?, ?, ?, ?)',
      [user.user_id, user.name, user.kelas, filename]
    );

    const attendanceData = {
      success: true,
      recognized: true,
      user_id: user.user_id,
      name: user.name,
      kelas: user.kelas,
      photo: filename,
      confidence: matchResult.distance,
      device_id: device_id,
      time: new Date()
    };

    const io = req.app.get('io');
    if (io) io.emit('new_attendance', attendanceData);

    return res.status(200).json({ success: true, message: "Attendance saved", data: attendanceData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error during recognition" });
  }
});

router.post('/iot/register-face', async (req, res) => {
  try {
    const { user_id, image } = req.body;
    if (!user_id || !image) return res.status(400).json({ success: false, message: "Missing data" });
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const descriptor = await faceService.encodeFace(buffer);
    
    if (!descriptor) return res.status(400).json({ success: false, message: "No face detected" });

    const filename = `face_${user_id}_${Date.now()}.jpg`;
    fs.writeFileSync(path.join(__dirname, '..', 'uploads', filename), buffer);

    await db.query(
      'UPDATE pengguna SET face_image = ?, face_descriptor = ? WHERE id_user = ?',
      [filename, JSON.stringify(Array.from(descriptor)), user_id]
    );

    return res.status(200).json({ success: true, message: "Face registered" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/attendance/location', async (req, res) => {
  try {
    const { user_id, latitude, longitude, location_name } = req.body;
    const [latest] = await db.query('SELECT id FROM attendance WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user_id]);
    if (latest.length === 0) return res.status(404).json({ success: false, message: 'No attendance' });

    await db.query('UPDATE attendance SET latitude = ?, longitude = ?, location_name = ? WHERE id = ?', 
      [latitude, longitude, location_name, latest[0].id]);

    const io = req.app.get('io');
    if (io) io.emit('update_location', { user_id, latitude, longitude, location_name });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/iot/health', iotCtrl.healthCheck);
router.get('/iot/stats', auth, roleCheck('admin'), iotCtrl.getIoTStats);

// ======================================================
// 10. MANUAL SCAN PERMISSION
// ======================================================
router.get('/manual-scan/permission', auth, manualScanCtrl.getPermission);
router.post('/manual-scan/allow', auth, roleCheck('dosen', 'admin'), manualScanCtrl.allowManualScan);
router.post('/manual-scan/disable', auth, roleCheck('dosen', 'admin'), manualScanCtrl.disableManualScan);
router.get('/manual-scan/users', auth, roleCheck('dosen', 'admin'), manualScanCtrl.getUsersWithPermissions);
router.get('/manual-scan/students', auth, roleCheck('dosen', 'admin'), manualScanCtrl.getUsersWithPermissions);

// ======================================================
// 11. TEST ENDPOINT (ESP32 Health Check)
// ======================================================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'ESP32 Connected to Attendify Backend',
    server_time: new Date().toISOString(),
    ip_received: req.ip || req.connection.remoteAddress
  });
});

module.exports = router;