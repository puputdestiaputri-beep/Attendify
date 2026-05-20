<?php
/**
 * Admin Header
 */
$pageTitle = defined('PAGE_TITLE') ? PAGE_TITLE : 'Dashboard Admin';
$pageIcon = defined('PAGE_ICON') ? PAGE_ICON : 'bi-house';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> — StopKontak Otomatis</title>
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- DataTables -->
    <link href="https://cdn.datatables.net/1.13.8/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <!-- Admin CSS -->
    <link href="/stopgo/admin/assets/css/admin.css" rel="stylesheet">
    <!-- jQuery (Needed for DataTables) -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>

<!-- Sidebar Overlay -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<div class="main-wrapper">
    <!-- Topbar -->
    <nav class="topbar">
        <button class="btn-sidebar-toggle" id="sidebarToggle"><i class="bi bi-list"></i></button>
        <div class="topbar-title ms-3 d-none d-md-block fw-semibold"><i class="bi <?= $pageIcon ?> me-2"></i><?= $pageTitle ?></div>
        <div class="ms-auto d-flex align-items-center gap-3">
            <div class="topbar-clock d-none d-sm-flex align-items-center text-muted small">
                <i class="bi bi-clock me-1"></i> <span id="topbarTime">--:--:--</span>
            </div>
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle text-light" data-bs-toggle="dropdown">
                    <img src="https://ui-avatars.com/api/?name=<?= urlencode($_SESSION['admin_name'] ?? 'Admin') ?>&background=random&color=fff" alt="User" class="rounded-circle me-2" width="32" height="32">
                    <span class="d-none d-md-inline small fw-medium"><?= htmlspecialchars($_SESSION['admin_name'] ?? 'Administrator') ?></span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                    <li><a class="dropdown-item" href="/stopgo/admin/pages/profile.php"><i class="bi bi-person me-2"></i>Profil Saya</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="/stopgo/admin/logout.php"><i class="bi bi-box-arrow-right me-2"></i>Keluar</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Page Content Wrapper -->
    <div class="admin-content">
