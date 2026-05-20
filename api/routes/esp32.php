<?php
/**
 * ESP32 Endpoint Routes — /api/esp32
 * Stop Kontak Otomatis
 * Endpoint khusus untuk komunikasi dengan ESP32 DevKit V1
 */

require_once __DIR__ . '/../models/Device.php';
require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../models/Log.php';

$deviceModel   = new Device();
$scheduleModel = new Schedule();
$logModel      = new Log();

$segments    = array_values(array_filter(explode('/', trim($_SERVER['REQUEST_URI'], '/'))));
$esp32Index  = array_search('esp32', $segments);
$subEndpoint = $segments[$esp32Index + 1] ?? '';
$param       = $segments[$esp32Index + 2] ?? '';

$method = $_SERVER['REQUEST_METHOD'];
$ip     = $_SERVER['REMOTE_ADDR'];

// ── POST /api/esp32/heartbeat ────────────────────────────────────────────────
// ESP32 mengirim status dan mendapatkan perintah relay
if ($method === 'POST' && $subEndpoint === 'heartbeat') {
    $body = getRequestBody();
    
    if (empty($body['device_key'])) {
        sendError('device_key wajib diisi', 401);
    }
    
    $device = $deviceModel->getByKey($body['device_key']);
    if (!$device) {
        sendError('Device tidak dikenal. Daftarkan device terlebih dahulu.', 403);
    }
    
    // Update heartbeat
    $deviceModel->updateHeartbeat($device['id'], $ip);
    
    // Simpan log heartbeat (hanya jika relay_status berubah)
    $currentStatus = (int)($body['relay_status'] ?? $device['relay_status']);
    if ($currentStatus !== (int)$device['relay_status']) {
        $action = $currentStatus ? 'ON' : 'OFF';
        $logModel->insert($device['id'], $action, 'esp32', $currentStatus, $ip, 'Status update dari ESP32');
    }
    
    // Refresh device data setelah update
    $device = $deviceModel->getById($device['id']);
    
    // Cek jadwal aktif yang harus dieksekusi (server-side schedule check)
    $schedules     = $scheduleModel->getActiveByDeviceKey($body['device_key']);
    $currentTime   = date('H:i:s');
    $currentDay    = (int)date('w'); // 0=Sun, 6=Sat
    $scheduleAction = null;
    
    foreach ($schedules as $sch) {
        $days = explode(',', $sch['days']);
        if (!in_array((string)$currentDay, $days)) continue;
        
        // Handle jadwal yang melewati tengah malam
        $timeOn  = $sch['time_on'];
        $timeOff = $sch['time_off'];
        
        if ($timeOn <= $timeOff) {
            // Normal: ON kemudian OFF di hari yang sama
            if ($currentTime >= $timeOn && $currentTime < $timeOff) {
                $scheduleAction = 'ON';
            } elseif ($currentTime >= $timeOff) {
                $scheduleAction = 'OFF';
            }
        } else {
            // Melewati tengah malam (e.g., ON 20:00, OFF 06:00)
            if ($currentTime >= $timeOn || $currentTime < $timeOff) {
                $scheduleAction = 'ON';
            } else {
                $scheduleAction = 'OFF';
            }
        }
        break; // Pakai jadwal pertama yang match
    }
    
    // Tentukan perintah relay akhir
    $commandRelay = (int)$device['relay_status']; // Default: ikuti DB
    
    if ($scheduleAction !== null) {
        $commandRelay = $scheduleAction === 'ON' ? 1 : 0;
        
        // Update DB jika jadwal mengubah status
        if ($commandRelay !== (int)$device['relay_status']) {
            $deviceModel->setRelay($device['id'], $commandRelay);
            $logModel->insert($device['id'], $scheduleAction, 'schedule', $commandRelay, $ip, 'Dieksekusi oleh jadwal');
        }
    }
    
    sendSuccess([
        'device_id'    => $device['id'],
        'device_name'  => $device['name'],
        'relay_command'=> $commandRelay,   // Perintah untuk ESP32
        'relay_status' => $commandRelay,
        'server_time'  => date('Y-m-d H:i:s'),
    ], 'Heartbeat diterima');
}

// ── GET /api/esp32/schedules/{device_key} ───────────────────────────────────
// ESP32 mengunduh semua jadwal aktif (untuk eksekusi lokal)
if ($method === 'GET' && $subEndpoint === 'schedules' && !empty($param)) {
    $device = $deviceModel->getByKey($param);
    if (!$device) sendError('Device tidak dikenal', 403);
    
    $schedules = $scheduleModel->getActiveByDeviceKey($param);
    sendSuccess([
        'device_id'   => $device['id'],
        'device_name' => $device['name'],
        'schedules'   => $schedules,
        'server_time' => date('Y-m-d H:i:s'),
        'timestamp'   => time(),
    ]);
}

// ── POST /api/esp32/register ─────────────────────────────────────────────────
// Auto-register ESP32 jika belum terdaftar
if ($method === 'POST' && $subEndpoint === 'register') {
    $body = getRequestBody();
    if (empty($body['device_key']) || empty($body['name'])) {
        sendError('device_key dan name wajib diisi');
    }
    
    $existing = $deviceModel->getByKey($body['device_key']);
    if ($existing) {
        $deviceModel->updateHeartbeat($existing['id'], $ip);
        sendSuccess($existing, 'Device sudah terdaftar');
    }
    
    $newId  = $deviceModel->create($body);
    $device = $deviceModel->getById($newId);
    $logModel->insert($newId, 'REGISTER', 'esp32', 0, $ip, 'Auto-register dari ESP32');
    sendSuccess($device, 'Device berhasil diregistrasi', 201);
}

sendError('ESP32 endpoint tidak valid', 404);
