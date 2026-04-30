const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Rate limiting map to prevent spam from same device
const deviceLastScan = new Map();
const RATE_LIMIT_SECONDS = 5;

/**
 * IoT Recognition Endpoint
 * Receives base64 image from ESP32-CAM and performs face recognition
 * 
 * POST /api/iot/recognize
 * Body: { image: base64, device_id: string, timestamp: ISO8601 }
 */
exports.recognizeFromIoT = async (req, res) => {
  try {
    const { image, device_id, timestamp, mode = 'auto' } = req.body;

    // ── Validation ──────────────────────────────────
    if (!image || !device_id) {
      return res.status(400).json({
        status: 'error',
        message: 'image and device_id are required'
      });
    }

    if (mode !== 'auto' && mode !== 'manual') {
      return res.status(400).json({
        status: 'error',
        message: 'mode must be "auto" or "manual"'
      });
    }

    // Validate image size (max 5MB)
    const imageSizeKB = Buffer.byteLength(image, 'base64') / 1024;
    if (imageSizeKB > 5120) {
      return res.status(400).json({
        status: 'error',
        message: 'Image too large (max 5MB)'
      });
    }

    // ── Rate Limiting ───────────────────────────────
    const now = Math.floor(Date.now() / 1000);
    const lastScan = deviceLastScan.get(device_id) || 0;
    
    if (now - lastScan < RATE_LIMIT_SECONDS) {
      return res.status(429).json({
        status: 'rate_limited',
        message: `Please wait before scanning again (${RATE_LIMIT_SECONDS}s limit)`
      });
    }

    deviceLastScan.set(device_id, now);

    // ── Log IoT Activity ────────────────────────────
    const logTimestamp = new Date().toISOString();
    console.log(`[IoT] ${logTimestamp} | Device: ${device_id} | Mode: ${mode} | Image size: ${imageSizeKB.toFixed(2)}KB`);

    // ── Save image to temp folder (for debugging) ───
    const imagesDir = path.join(__dirname, '../uploads/iot-captures');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const fileName = `${device_id}-${Date.now()}-${mode}.jpg`;
    const filePath = path.join(imagesDir, fileName);
    
    try {
      fs.writeFileSync(filePath, Buffer.from(image, 'base64'));
      console.log(`[IoT] Image saved: ${fileName}`);
    } catch (saveError) {
      console.warn(`[IoT] Failed to save image: ${saveError.message}`);
    }

    // ── Face Recognition Logic ──────────────────────
    // TODO: Integrate with actual face recognition library (e.g., face-api.js, OpenCV, etc.)
    // For now, using a simple matching algorithm based on device and timing
    
    const matchedUser = await performFaceRecognition(image, device_id);

    if (!matchedUser) {
      // Log unknown face
      await logIotActivity(device_id, 'unknown', null, 'face_not_recognized');
      
      return res.json({
        status: 'unknown',
        message: 'Face not recognized in database'
      });
    }

    // ── MANUAL MODE PERMISSION CHECK (NEW) ──────────
    let manualMode = 0;
    if (mode === 'manual') {
      const [permissions] = await db.query(
        `SELECT id_permission FROM manual_scan_permission 
         WHERE user_id = ? AND enabled = 1 AND (expires_at IS NULL OR expires_at > NOW())`,
        [matchedUser.id_user]
      );
      
      if (permissions.length === 0) {
        await logIotActivity(device_id, 'manual_denied', matchedUser.id_user, 'no_active_permission');
        return res.status(403).json({
          status: 'manual_denied',
          message: 'Manual scan not permitted by dosen'
        });
      }
      
      manualMode = 1;
      console.log(`[ManualScan] Permission OK for user ${matchedUser.id_user}`);
    }

    // ── Check if user already scanned today ─────────
    const [existingAbsensi] = await db.query(
      `SELECT id_absensi FROM absensi 
       WHERE user_id = ? 
       AND jadwal_id = (
         SELECT id_jadwal FROM jadwal_kuliah 
         WHERE CURRENT_TIME() BETWEEN jam_mulai AND jam_selesai 
         LIMIT 1
       )
       AND DATE(tanggal) = CURDATE()`,
      [matchedUser.id_user]
    );

    if (existingAbsensi.length > 0) {
      // Log duplicate scan
      await logIotActivity(device_id, 'duplicate', matchedUser.id_user, 'already_scanned_today');
      
      return res.json({
        status: 'duplicate',
        message: `User ${matchedUser.nama} already scanned today`,
        user_id: matchedUser.id_user,
        name: matchedUser.nama
      });
    }

    // ── Find active schedule ────────────────────────
    const [activeJadwal] = await db.query(
      `SELECT id_jadwal, jam_mulai 
       FROM jadwal_kuliah 
       WHERE CURRENT_TIME() BETWEEN jam_mulai AND jam_selesai 
       LIMIT 1`
    );

    if (activeJadwal.length === 0) {
      // Log: no active schedule
      await logIotActivity(device_id, 'no_schedule', matchedUser.id_user, 'no_active_schedule');
      
      return res.json({
        status: 'no_schedule',
        message: 'No active class schedule at this time',
        user_id: matchedUser.id_user,
        name: matchedUser.nama
      });
    }

    // ── Determine attendance status ─────────────────
    const jadwalId = activeJadwal[0].id_jadwal;
    const jamMulai = new Date(`1970-01-01T${activeJadwal[0].jam_mulai}Z`);
    const waktuAbsen = new Date(`1970-01-01T${new Date().toTimeString().split(' ')[0]}Z`);
    
    let statusAbsen = 'hadir';
    if (waktuAbsen > new Date(jamMulai.getTime() + 15 * 60000)) {
      statusAbsen = 'terlambat';
    }

    // ── Insert attendance record ────────────────────
    await db.query(
      `INSERT INTO absensi (user_id, jadwal_id, tanggal, waktu_datang, status, manual_mode) 
       VALUES (?, ?, NOW(), CURTIME(), ?, ?)`,
      [matchedUser.id_user, jadwalId, statusAbsen, manualMode]
    );

    // ── Create notification ─────────────────────────
    await db.query(
      `INSERT INTO notifikasi (user_id, judul, pesan, jenis_notif, tanggal, status_baca) 
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [
        matchedUser.id_user,
        'Absensi IoT',
        `Absensi berhasil via ESP32: ${statusAbsen === 'hadir' ? '✅ Hadir' : '⏰ Terlambat'}`,
        'absensi_iot',
        'belum'
      ]
    );

    // ── DISABLE MANUAL PERMISSION after success ─────
    if (manualMode === 1) {
      await db.query(
        `UPDATE manual_scan_permission 
         SET enabled = 0 
         WHERE user_id = ? AND enabled = 1`,
        [matchedUser.id_user]
      );
      console.log(`[ManualScan] Auto-disabled permission for user ${matchedUser.id_user}`);
    }

    // ── Log successful scan ─────────────────────────
    await logIotActivity(
      device_id,
      'matched',
      matchedUser.id_user,
      statusAbsen + (manualMode ? ' (manual)' : '')
    );

    // ── Success response ────────────────────────────
    return res.json({
      status: 'matched',
      message: 'Attendance recorded successfully',
      user_id: matchedUser.id_user,
      name: matchedUser.nama,
      attendance_status: statusAbsen,
      mode: mode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[IoT] Error in recognizeFromIoT:', error);
    
    // Log error
    try {
      await logIotActivity(
        req.body.device_id || 'unknown',
        'error',
        null,
        error.message
      );
    } catch (logError) {
      console.error('[IoT] Failed to log error:', logError);
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error processing IoT recognition'
    });
  }
};

/**
 * Perform face recognition using image data
 * TODO: Replace with actual face recognition library
 * 
 * Current implementation: Placeholder for future ML integration
 * Options:
 *  - face-api.js
 *  - OpenCV
 *  - TensorFlow.js with face detection
 *  - AWS Rekognition
 */
async function performFaceRecognition(base64Image, deviceId) {
  try {
    // PLACEHOLDER: In production, integrate with actual face recognition service
    // For now, return a mock implementation for testing
    
    // Get all users with face data
    const [users] = await db.query(
      `SELECT id_user, nama FROM pengguna 
       WHERE status = 'Y' 
       AND id_wajah IS NOT NULL
       LIMIT 1`
    );

    // Return first active user for testing
    // TODO: Replace with actual facial recognition matching
    if (users.length > 0) {
      return users[0];
    }

    return null;
  } catch (error) {
    console.error('[IoT] Face recognition error:', error);
    return null;
  }
}

/**
 * Log IoT activity for monitoring and debugging
 */
async function logIotActivity(deviceId, status, userId, details) {
  try {
    // Create logs table entry if exists
    await db.query(
      `INSERT INTO iot_logs (device_id, status, user_id, details, timestamp) 
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE timestamp = NOW()`,
      [deviceId, status, userId || null, details]
    ).catch(() => {
      // Table might not exist, log to console instead
      console.log(
        `[IoT Log] Device: ${deviceId} | Status: ${status} | User: ${userId} | Details: ${details}`
      );
    });
  } catch (error) {
    console.error('[IoT] Error logging activity:', error);
  }
}

/**
 * Health check endpoint for IoT devices
 */
exports.healthCheck = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({
        status: 'error',
        message: 'device_id is required'
      });
    }

    console.log(`[IoT] Health check from device: ${device_id}`);

    // Check if active schedule exists
    const [activeJadwal] = await db.query(
      `SELECT id_jadwal FROM jadwal_kuliah 
       WHERE CURRENT_TIME() BETWEEN jam_mulai AND jam_selesai 
       LIMIT 1`
    );

    return res.json({
      status: 'ok',
      device_id: device_id,
      server_time: new Date().toISOString(),
      active_schedule: activeJadwal.length > 0,
      api_version: '1.0'
    });
  } catch (error) {
    console.error('[IoT] Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
}

/**
 * Get IoT statistics (admin only)
 */
exports.getIoTStats = async (req, res) => {
  try {
    // Count recent IoT scans
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN DATE(tanggal) = CURDATE() THEN 1 END) as today_scans,
        COUNT(CASE WHEN status = 'hadir' THEN 1 END) as on_time,
        COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as late
       FROM absensi 
       WHERE tanggal >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    return res.json({
      status: 'success',
      data: stats[0]
    });
  } catch (error) {
    console.error('[IoT] Stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get IoT statistics'
    });
  }
}
