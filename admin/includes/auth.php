<?php
/**
 * Auth Helper
 */
function requireLogin() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['admin_h_logged_in'])) {
        header('Location: /stopgo/admin/login.php');
        exit;
    }
}

function requireRole($role) {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['admin_role']) || $_SESSION['admin_role'] !== $role) {
        die("<h1>403 Forbidden</h1><p>Anda tidak memiliki akses ke halaman ini.</p>");
    }
}

function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

function adminLog($pdo, $action, $target = '', $detail = '') {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $admin_id = $_SESSION['admin_id'] ?? 0;
    if (!$admin_id) return;
    
    $ip = $_SERVER['REMOTE_ADDR'] === '::1' ? '127.0.0.1' : $_SERVER['REMOTE_ADDR'];
    $stmt = $pdo->prepare("INSERT INTO admin_logs (admin_id, action, target, detail, ip_address) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$admin_id, $action, $target, $detail, $ip]);
}
