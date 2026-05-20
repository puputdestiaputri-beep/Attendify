<?php
/**
 * Log Routes — /api/logs
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../models/Log.php';

$log    = new Log();
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/logs?device_id=X&limit=100
if ($method === 'GET') {
    $deviceId = isset($_GET['device_id']) ? (int) $_GET['device_id'] : 0;
    $limit    = isset($_GET['limit'])     ? min((int) $_GET['limit'], 500) : 100;
    
    $data  = $log->getAll($deviceId, $limit);
    $stats = $log->getStats();
    
    sendSuccess(['logs' => $data, 'stats' => $stats]);
}

// POST /api/logs — manual log insert
if ($method === 'POST') {
    $body = getRequestBody();
    if (empty($body['device_id']) || empty($body['action'])) {
        sendError('device_id dan action wajib diisi');
    }
    $id = $log->insert(
        (int) $body['device_id'],
        $body['action'],
        $body['triggered_by'] ?? 'manual',
        $body['relay_status'] ?? null,
        $_SERVER['REMOTE_ADDR'],
        $body['notes'] ?? null
    );
    sendSuccess(['id' => $id], 'Log berhasil disimpan', 201);
}

// DELETE /api/logs?days=30 — purge old logs
if ($method === 'DELETE') {
    $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
    $log->purgeOld($days);
    sendSuccess(null, "Log lebih lama dari {$days} hari berhasil dihapus");
}

sendError('Endpoint tidak valid', 405);
