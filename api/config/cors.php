<?php
/**
 * CORS Headers Configuration
 * Stop Kontak Otomatis
 * Mengizinkan akses dari browser dan ESP32
 */

function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Device-Key');
    header('Content-Type: application/json; charset=UTF-8');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Send success JSON response
 */
function sendSuccess(mixed $data, string $message = 'Success', int $code = 200): void {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send error JSON response
 */
function sendError(string $message, int $code = 400, mixed $data = null): void {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Get JSON request body
 */
function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
