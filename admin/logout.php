<?php
session_start();
require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (!empty($_SESSION['admin_h_logged_in'])) {
    $pdo = Database::getConnection();
    adminLog($pdo, 'LOGOUT', '', 'Sukses Logout');
}

session_destroy();
header('Location: login.php');
exit;
