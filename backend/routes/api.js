const express = require('express');
const router = express.Router();
const manualScanCtrl = require('../controllers/manualScanController');

// Middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Controllers
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


// 1. AUTH ROUTES
router.post('/register', authCtrl.register);
router.post('/register/admin-dosen', auth, roleCheck('admin'), authCtrl.registerAdminOrDosen);
router.post('/login', authCtrl.login);
router.get('/profile', auth, authCtrl.getProfile);


// 2. USER ROUTES
router.get('/users', auth, userCtrl.getAllUsers);
router.get('/users/:id', auth, userCtrl.getUserById);
router.put('/users/:id', auth, roleCheck('admin'), userCtrl.updateUser);
router.delete('/users/:id', auth, roleCheck('admin'), userCtrl.deleteUser);

// 3. JADWAL ROUTES
router.get('/jadwal', auth, jadwalCtrl.getAllJadwal);
router.post('/jadwal', auth, roleCheck('admin', 'dosen'), jadwalCtrl.createJadwal);
router.put('/jadwal/:id', auth, roleCheck('admin', 'dosen'), jadwalCtrl.updateJadwal);
router.delete('/jadwal/:id', auth, roleCheck('admin'), jadwalCtrl.deleteJadwal);

// 4. ABSENSI ROUTES (Core ESP32 Feature)
router.post('/absensi/scan', absensiCtrl.scanWajah);
router.post('/absensi/finish', auth, roleCheck('dosen', 'admin'), absensiCtrl.finishClass);
router.get('/absensi', auth, absensiCtrl.getAllAbsensi);
router.get('/absensi/:mahasiswa_id', auth, absensiCtrl.getAbsensiByMahasiswa);
router.post('/absensi/update', auth, roleCheck('dosen', 'admin'), absensiCtrl.updateAttendanceStatus);
router.get('/admin/attendance', auth, roleCheck('admin'), absensiCtrl.getAdminAttendance);


// 5. REPORTS
router.get('/reports/absensi', auth, roleCheck('admin'), reportCtrl.exportAttendance);
router.get('/reports/excel', auth, roleCheck('admin'), reportCtrl.exportExcel);
router.get('/reports/pdf', auth, roleCheck('admin'), reportCtrl.exportPDF);
router.post('/reports', auth, reportCtrl.createReport);
router.get('/admin/reports', auth, roleCheck('admin'), reportCtrl.getAdminReports);
router.put('/admin/reports/:id/status', auth, roleCheck('admin'), reportCtrl.updateReportStatus);


// 6. NOTIFIKASI
router.get('/notifikasi', auth, notifCtrl.getNotifikasi);
router.post('/notifikasi', auth, roleCheck('admin', 'dosen', 'mahasiswa'), notifCtrl.createNotifikasi);
router.put('/notifikasi/read', auth, notifCtrl.markAsRead);

// 6. DASHBOARDS
router.get('/dashboard/admin', auth, roleCheck('admin'), dashCtrl.getAdminDashboard);
router.get('/dashboard/dosen', auth, roleCheck('dosen'), dashCtrl.getDosenDashboard);
router.get('/dashboard/mahasiswa', auth, roleCheck('mahasiswa'), dashCtrl.getMahasiswaDashboard);
// 7. WAJAH & IoT VALIDATION
router.get('/wajah/available-users', auth, roleCheck('admin'), wajahCtrl.getAvailableUsers);
router.post('/wajah/start-session', auth, roleCheck('admin'), wajahCtrl.startValidationSession);
router.get('/wajah/status/:user_id', auth, wajahCtrl.getValidationStatus);
router.post('/wajah/iot-capture', wajahCtrl.uploadIotFaceData); // Called by ESP32

// 8. SYSTEM LOGS
router.get('/logs', auth, roleCheck('admin'), logCtrl.getAllLogs);
router.get('/logs/stats', auth, roleCheck('admin'), logCtrl.getLogStats);

// 9. KELAS ROUTES
router.get('/kelas', auth, kelasCtrl.getAllKelas);
router.get('/kelas/:id', auth, kelasCtrl.getKelasById);

// 10. IoT / ESP32 INTEGRATION ROUTES
router.post('/iot/recognize', iotCtrl.recognizeFromIoT);
router.post('/iot/health', iotCtrl.healthCheck);
router.get('/iot/stats', auth, roleCheck('admin'), iotCtrl.getIoTStats);

// 11. MANUAL SCAN PERMISSION ROUTES (Dosen-controlled fallback)
router.get('/manual-scan/permission', auth, manualScanCtrl.getPermission);
router.post('/manual-scan/allow', auth, roleCheck('dosen'), manualScanCtrl.allowManualScan);
router.post('/manual-scan/disable', auth, roleCheck('dosen'), manualScanCtrl.disableManualScan);
router.get('/manual-scan/users', auth, roleCheck('dosen'), manualScanCtrl.getUsersWithPermissions);


// 11. MANUAL SCAN PERMISSION ROUTES (New Fallback Feature)
router.get('/manual-scan/permission', auth, manualScanCtrl.getPermission);
router.post('/manual-scan/allow', auth, roleCheck('dosen'), manualScanCtrl.allowManualScan);
router.post('/manual-scan/disable', auth, roleCheck('dosen'), manualScanCtrl.disableManualScan);
router.get('/manual-scan/users', auth, roleCheck('dosen'), manualScanCtrl.getUsersWithPermissions);

module.exports = router;
