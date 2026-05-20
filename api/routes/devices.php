<?php
/**
 * Device Routes — /api/devices
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../models/Device.php';
require_once __DIR__ . '/../models/Log.php';

$device = new Device();
$log    = new Log();

// Parse ID from URL (e.g., /api/devices/5 or /api/devices/5/toggle)
$segments = array_filter(explode('/', trim($_SERVER['REQUEST_URI'], '/')));
$segments = array_values($segments);

// Find position of 'devices' in URL
$devIndex = array_search('devices', $segments);
$id       = isset($segments[$devIndex + 1]) ? (int) $segments[$devIndex + 1] : 0;
$action   = $segments[$devIndex + 2] ?? '';

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/devices — list all devices
if ($method === 'GET' && $id === 0) {
    sendSuccess($device->getAll());
}

// GET /api/devices/{id} — get single device
if ($method === 'GET' && $id > 0 && $action === '') {
    $d = $device->getById($id);
    if (!$d) sendError('Device tidak ditemukan', 404);
    sendSuccess($d);
}

// POST /api/devices — create new device
if ($method === 'POST') {
    $body = getRequestBody();
    if (empty($body['name'])) sendError('Nama device wajib diisi');
    
    $newId = $device->create($body);
    $d = $device->getById($newId);
    $log->insert($newId, 'REGISTER', 'system', 0, $_SERVER['REMOTE_ADDR'], 'Device baru terdaftar');
    sendSuccess($d, 'Device berhasil ditambahkan', 201);
}

// PUT /api/devices/{id} — update device info
if ($method === 'PUT' && $id > 0 && $action === '') {
    $body = getRequestBody();
    if (!$device->getById($id)) sendError('Device tidak ditemukan', 404);
    $device->update($id, $body);
    sendSuccess($device->getById($id), 'Device berhasil diupdate');
}

// PUT /api/devices/{id}/toggle — toggle relay
if ($method === 'PUT' && $id > 0 && $action === 'toggle') {
    $result = $device->toggleRelay($id);
    if (!$result) sendError('Device tidak ditemukan', 404);
    
    $status  = $result['relay_status'];
    $action_str = $status ? 'ON' : 'OFF';
    $log->insert($id, $action_str, 'manual', $status, $_SERVER['REMOTE_ADDR'], 'Toggle via dashboard');
    sendSuccess($result, "Relay berhasil di-{$action_str}");
}

// PUT /api/devices/{id}/set — set relay explicit (for schedule)
if ($method === 'PUT' && $id > 0 && $action === 'set') {
    $body      = getRequestBody();
    $newStatus = isset($body['status']) ? (int) $body['status'] : -1;
    if ($newStatus < 0 || $newStatus > 1) sendError('Status tidak valid (0 atau 1)', 422);
    
    $device->setRelay($id, $newStatus);
    $action_str = $newStatus ? 'ON' : 'OFF';
    $log->insert($id, $action_str, $body['triggered_by'] ?? 'manual', $newStatus, $_SERVER['REMOTE_ADDR']);
    sendSuccess(['id' => $id, 'relay_status' => $newStatus], "Relay di-set {$action_str}");
}

// DELETE /api/devices/{id} — delete device
if ($method === 'DELETE' && $id > 0) {
    if (!$device->getById($id)) sendError('Device tidak ditemukan', 404);
    $device->delete($id);
    sendSuccess(null, 'Device berhasil dihapus');
}

sendError('Endpoint tidak valid', 405);
