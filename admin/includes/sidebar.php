<?php
/**
 * Admin Sidebar
 */
$current_page = basename($_SERVER['PHP_SELF'], '.php');
$dir_name = basename(dirname($_SERVER['PHP_SELF']));
if ($dir_name === 'admin' && $current_page === 'index') $current_page = 'dashboard';
?>
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-brand">
        <div class="brand-icon"><i class="bi bi-lightning-charge-fill"></i></div>
        <div>
            <div class="brand-name">StopKontak</div>
            <div class="brand-sub">Admin Panel v2.0</div>
        </div>
    </div>
    
    <div class="sidebar-user">
        <div class="user-info">
            <div class="user-name"><?= htmlspecialchars($_SESSION['admin_name'] ?? 'Admin') ?></div>
            <div class="user-role"><span class="badge bg-<?= ($_SESSION['admin_role'] ?? '') === 'superadmin' ? 'danger' : 'primary' ?>"><?= ucfirst($_SESSION['admin_role'] ?? 'Admin') ?></span></div>
        </div>
    </div>

    <div class="sidebar-nav">
        <div class="nav-label">MENU UTAMA</div>
        <a href="/stopgo/admin/" class="nav-item <?= $current_page === 'dashboard' ? 'active' : '' ?>">
            <i class="bi bi-grid-1x2"></i> <span>Dashboard</span>
        </a>
        <a href="/stopgo/admin/pages/devices.php" class="nav-item <?= $current_page === 'devices' ? 'active' : '' ?>">
            <i class="bi bi-cpu"></i> <span>Perangkat (ESP32)</span>
        </a>
        <a href="/stopgo/admin/pages/schedules.php" class="nav-item <?= $current_page === 'schedules' ? 'active' : '' ?>">
            <i class="bi bi-calendar-week"></i> <span>Jadwal Otomatis</span>
        </a>
        <a href="/stopgo/admin/pages/logs.php" class="nav-item <?= $current_page === 'logs' ? 'active' : '' ?>">
            <i class="bi bi-journal-text"></i> <span>Log Aktivitas Relay</span>
        </a>

        <?php if(($_SESSION['admin_role'] ?? '') === 'superadmin'): ?>
        <div class="nav-label mt-3">SISTEM (SUPERADMIN)</div>
        <a href="/stopgo/admin/pages/admins.php" class="nav-item <?= $current_page === 'admins' ? 'active' : '' ?>">
            <i class="bi bi-people"></i> <span>Kelola Admin</span>
        </a>
        <a href="/stopgo/admin/pages/admin_logs.php" class="nav-item <?= $current_page === 'admin_logs' ? 'active' : '' ?>">
            <i class="bi bi-shield-check"></i> <span>Audit Trail Admin</span>
        </a>
        <?php endif; ?>

        <div class="nav-label mt-3">AKUN</div>
        <a href="/stopgo/admin/pages/profile.php" class="nav-item <?= $current_page === 'profile' ? 'active' : '' ?>">
            <i class="bi bi-person-circle"></i> <span>Profil Saya</span>
        </a>
        <a href="/stopgo/admin/logout.php" class="nav-item text-danger">
            <i class="bi bi-box-arrow-left"></i> <span>Keluar</span>
        </a>
    </div>
</aside>
