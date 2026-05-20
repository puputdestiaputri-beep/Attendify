<?php
/**
 * Schedule Routes — /api/schedules
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../models/Schedule.php';

$schedule = new Schedule();

$segments = array_values(array_filter(explode('/', trim($_SERVER['REQUEST_URI'], '/'))));
$schIndex = array_search('schedules', $segments);
$id       = isset($segments[$schIndex + 1]) ? (int) $segments[$schIndex + 1] : 0;
$action   = $segments[$schIndex + 2] ?? '';

$method   = $_SERVER['REQUEST_METHOD'];

// GET /api/schedules?device_id=X
if ($method === 'GET' && $id === 0) {
    $deviceId = isset($_GET['device_id']) ? (int) $_GET['device_id'] : 0;
    sendSuccess($schedule->getAll($deviceId));
}

// GET /api/schedules/{id}
if ($method === 'GET' && $id > 0) {
    $s = $schedule->getById($id);
    if (!$s) sendError('Jadwal tidak ditemukan', 404);
    sendSuccess($s);
}

// POST /api/schedules — create schedule
if ($method === 'POST') {
    $body = getRequestBody();
    if (empty($body['device_id']) || empty($body['time_on']) || empty($body['time_off'])) {
        sendError('device_id, time_on, dan time_off wajib diisi');
    }
    if (empty($body['name'])) $body['name'] = 'Jadwal Baru';
    if (empty($body['days'])) $body['days']  = '0,1,2,3,4,5,6';
    
    $newId = $schedule->create($body);
    sendSuccess($schedule->getById($newId), 'Jadwal berhasil ditambahkan', 201);
}

// PUT /api/schedules/{id}
if ($method === 'PUT' && $id > 0 && $action === '') {
    $body = getRequestBody();
    if (!$schedule->getById($id)) sendError('Jadwal tidak ditemukan', 404);
    $schedule->update($id, $body);
    sendSuccess($schedule->getById($id), 'Jadwal berhasil diupdate');
}

// PUT /api/schedules/{id}/toggle — toggle active
if ($method === 'PUT' && $id > 0 && $action === 'toggle') {
    if (!$schedule->getById($id)) sendError('Jadwal tidak ditemukan', 404);
    $schedule->toggleActive($id);
    sendSuccess($schedule->getById($id), 'Status jadwal berhasil diubah');
}

// DELETE /api/schedules/{id}
if ($method === 'DELETE' && $id > 0) {
    if (!$schedule->getById($id)) sendError('Jadwal tidak ditemukan', 404);
    $schedule->delete($id);
    sendSuccess(null, 'Jadwal berhasil dihapus');
}

sendError('Endpoint tidak valid', 405);
