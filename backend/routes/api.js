const express = require('express');

const router = express.Router();

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

const manualScanCtrl =
require('../controllers/manualScanController');


// ======================================================
// 1. AUTH ROUTES
// ======================================================

router.post(
  '/register',
  authCtrl.register
);

router.post(
  '/register/admin-dosen',
  auth,
  roleCheck('admin'),
  authCtrl.registerAdminOrDosen
);

router.post(
  '/login',
  authCtrl.login
);

router.get(
  '/profile',
  auth,
  authCtrl.getProfile
);

router.post(
  '/profile/avatar',
  auth,
  authCtrl.uploadAvatar
);

router.put(
  '/profile/update',
  auth,
  authCtrl.updateProfile
);


// ======================================================
// 2. USER ROUTES
// ======================================================

router.get(
  '/users',
  auth,
  userCtrl.getAllUsers
);

router.get(
  '/users/:id',
  auth,
  userCtrl.getUserById
);

router.put(
  '/users/:id',
  auth,
  roleCheck('admin'),
  userCtrl.updateUser
);

router.delete(
  '/users/:id',
  auth,
  roleCheck('admin'),
  userCtrl.deleteUser
);


// ======================================================
// 3. JADWAL ROUTES
// ======================================================

router.get(
  '/jadwal',
  jadwalCtrl.getAllJadwal
);


// ======================================================
// 4. ABSENSI ROUTES
// ======================================================

router.post(
  '/absensi/scan',
  absensiCtrl.scanWajah
);

router.post(
  '/trigger-scan',
  absensiCtrl.triggerScan
);

router.post(
  '/absensi/finish',
  auth,
  roleCheck('dosen', 'admin'),
  absensiCtrl.finishClass
);

router.get(
  '/absensi',
  auth,
  absensiCtrl.getAllAbsensi
);

router.get(
  '/absensi/:mahasiswa_id',
  auth,
  absensiCtrl.getAbsensiByMahasiswa
);

router.post(
  '/absensi/update',
  auth,
  roleCheck('dosen', 'admin'),
  absensiCtrl.updateAttendanceStatus
);

router.get(
  '/admin/attendance',
  auth,
  roleCheck('admin'),
  absensiCtrl.getAdminAttendance
);


// ======================================================
// 5. REPORT ROUTES
// ======================================================

router.get(
  '/reports/absensi',
  auth,
  roleCheck('admin', 'dosen'),
  reportCtrl.exportAttendance
);

// =======================================
// PUBLIC TEMPORARY DOWNLOAD
// =======================================

router.get(
  '/reports/excel',
  reportCtrl.exportExcel
);

router.get(
  '/reports/pdf',
  reportCtrl.exportPDF
);

router.post(
  '/reports',
  auth,
  reportCtrl.createReport
);

router.get(
  '/admin/reports',
  auth,
  roleCheck('admin'),
  reportCtrl.getAdminReports
);

router.put(
  '/admin/reports/:id/status',
  auth,
  roleCheck('admin'),
  reportCtrl.updateReportStatus
);


// ======================================================
// 6. NOTIFIKASI
// ======================================================

router.get(
  '/notifikasi',
  auth,
  notifCtrl.getNotifikasi
);

router.post(
  '/notifikasi',
  auth,
  roleCheck(
    'admin',
    'dosen',
    'mahasiswa'
  ),
  notifCtrl.createNotifikasi
);

router.put(
  '/notifikasi/read',
  auth,
  notifCtrl.markAsRead
);


// ======================================================
// 7. DASHBOARD
// ======================================================

router.get(
  '/dashboard/admin',
  auth,
  roleCheck('admin'),
  dashCtrl.getAdminDashboard
);

router.get(
  '/dashboard/dosen',
  auth,
  roleCheck('dosen'),
  dashCtrl.getDosenDashboard
);

router.get(
  '/dashboard/mahasiswa',
  auth,
  roleCheck('mahasiswa'),
  dashCtrl.getMahasiswaDashboard
);


// ======================================================
// 8. WAJAH & VALIDATION
// ======================================================

router.get(
  '/wajah/available-users',
  auth,
  roleCheck('admin'),
  wajahCtrl.getAvailableUsers
);

router.post(
  '/wajah/start-session',
  auth,
  roleCheck('admin'),
  wajahCtrl.startValidationSession
);

router.get(
  '/wajah/status/:user_id',
  auth,
  wajahCtrl.getValidationStatus
);

router.post(
  '/wajah/iot-capture',
  wajahCtrl.uploadIotFaceData
);


// ======================================================
// 9. LOGS
// ======================================================

router.get(
  '/logs',
  auth,
  roleCheck('admin'),
  logCtrl.getAllLogs
);

router.get(
  '/logs/stats',
  auth,
  roleCheck('admin'),
  logCtrl.getLogStats
);

router.get(
  '/logs/recent',
  logCtrl.getRecentLogs
);


// ======================================================
// 10. KELAS
// ======================================================

router.get(
  '/kelas',
  auth,
  kelasCtrl.getAllKelas
);

router.get(
  '/kelas/:id',
  auth,
  kelasCtrl.getKelasById
);

router.get(
  '/kelas/:id/mahasiswa',
  kelasCtrl.getMahasiswaByKelas
);


// ======================================================
// 11. IoT / ESP32
// ======================================================

router.post(
  '/iot/recognize',
  async (req, res) => {

    try {

      console.log(
        'TRIGGER SCAN DUMMY'
      );

      return res.status(200).json({

        success: true,

        name: 'Rian Hidayat',

        nim: '22010001',

        status: 'HADIR',

        confidence: 98,

        scanned_at:
          new Date().toISOString(),

        message:
          'Dummy scan berhasil',
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({

        success: false,

        message:
          'Dummy scan gagal',
      });
    }
  }
);


// ======================================================
// 12. MANUAL SCAN ROUTES
// ======================================================

router.get(
  '/manual-scan/students',
  auth,
  roleCheck('dosen', 'admin'),
  manualScanCtrl.getUsersWithPermissions
);

router.get(
  '/manual-scan/check',
  auth,
  manualScanCtrl.getPermission
);

router.post(
  '/manual-scan/allow',
  auth,
  roleCheck('dosen', 'admin'),
  manualScanCtrl.allowManualScan
);

router.post(
  '/manual-scan/disable',
  auth,
  roleCheck('dosen', 'admin'),
  manualScanCtrl.disableManualScan
);


// ======================================================
// 13. TEST ENDPOINT
// ======================================================

router.get(
  '/test',
  (req, res) => {

    res.json({

      success: true,

      message:
        'ESP32 Connected to Attendify Backend',

      server_time:
        new Date().toISOString(),

      ip_received:
        req.ip ||
        req.connection.remoteAddress
    });
  }
);

module.exports = router;