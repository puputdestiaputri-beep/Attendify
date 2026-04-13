const express = require('express');
const router = express.Router();

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

// 1. AUTH ROUTES
router.post('/register', authCtrl.register);
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

// 5. REPORTS
router.get('/reports/absensi', auth, roleCheck('admin'), reportCtrl.exportAttendance);

// 6. NOTIFIKASI
router.get('/notifikasi', auth, notifCtrl.getNotifikasi);
router.post('/notifikasi', auth, roleCheck('admin', 'dosen'), notifCtrl.createNotifikasi);
router.put('/notifikasi/read', auth, notifCtrl.markAsRead);

// 6. DASHBOARDS
router.get('/dashboard/admin', auth, roleCheck('admin'), dashCtrl.getAdminDashboard);
router.get('/dashboard/dosen', auth, roleCheck('dosen'), dashCtrl.getDosenDashboard);
router.get('/dashboard/mahasiswa', auth, roleCheck('mahasiswa'), dashCtrl.getMahasiswaDashboard);

module.exports = router;
