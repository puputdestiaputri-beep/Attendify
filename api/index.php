<?php
/**
 * =====================================================
 * Stop Kontak Otomatis — Main API Router
 * Base URL: /stopgo/api/
 * =====================================================
 * 
 * Routes:
 *   GET/POST/PUT/DELETE  /api/devices
 *   GET/POST/PUT/DELETE  /api/schedules
 *   GET/POST/DELETE      /api/logs
 *   POST/GET             /api/esp32/*
 */

// Load dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/models/Device.php';

// Set CORS and Content-Type headers
setCorsHeaders();

// Parse the request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = strtok($uri, '?'); // Remove query string
$uri = rtrim($uri, '/');
$segments = array_values(array_filter(explode('/', $uri)));

// Find 'api' segment index to determine route
$apiIndex = array_search('api', $segments);
$route    = $segments[$apiIndex + 1] ?? '';

// Auto-mark offline for devices with stale heartbeat
$deviceModel = new Device();
$deviceModel->markOfflineAll();

// Route dispatch
switch ($route) {
    case 'devices':
        require_once __DIR__ . '/routes/devices.php';
        break;

    case 'schedules':
        require_once __DIR__ . '/routes/schedules.php';
        break;

    case 'logs':
        require_once __DIR__ . '/routes/logs.php';
        break;

    case 'esp32':
        require_once __DIR__ . '/routes/esp32.php';
        break;

    case '':
    case 'status':
        // Health check endpoint
        sendSuccess([
            'app'     => 'Stop Kontak Otomatis API',
            'version' => '1.0.0',
            'time'    => date('Y-m-d H:i:s'),
            'status'  => 'online',
        ], 'API berjalan dengan baik');
        break;

    default:
        sendError("Route '/{$route}' tidak ditemukan", 404);
        break;
}
