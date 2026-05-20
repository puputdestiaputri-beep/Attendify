<?php
/**
 * Admin Dashboard
 */
session_start();
require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/models/Device.php';
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$deviceModel = new Device();
$deviceModel->markOfflineAll();

$pdo = Database::getConnection();

// Quick Stats
$stats = [
    'devices' => $pdo->query("SELECT COUNT(*) FROM devices")->fetchColumn(),
    'online' => $pdo->query("SELECT COUNT(*) FROM devices WHERE is_online=1")->fetchColumn(),
    'schedules' => $pdo->query("SELECT COUNT(*) FROM schedules WHERE is_active=1")->fetchColumn(),
    'logs_today' => $pdo->query("SELECT COUNT(*) FROM logs WHERE DATE(created_at) = CURDATE()")->fetchColumn(),
];

$recentLogs = $pdo->query("
    SELECT l.*, d.name AS device_name 
    FROM logs l 
    LEFT JOIN devices d ON l.device_id = d.id 
    ORDER BY l.created_at DESC LIMIT 10
")->fetchAll();

define('PAGE_TITLE', 'Dashboard Admin');
define('PAGE_ICON', 'bi-house-door');
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<div class="content-header">
    <h2 class="h4 fw-bold mb-1">Beranda Admin</h2>
    <p class="text-muted small mb-0">Selamat datang kembali, <?= htmlspecialchars($_SESSION['admin_name']) ?>!</p>
</div>

<div class="row g-4 mb-4">
    <div class="col-md-3 col-sm-6">
        <div class="stat-card border-primary">
            <div class="stat-icon bg-primary text-white"><i class="bi bi-cpu"></i></div>
            <div class="stat-data">
                <div class="stat-value text-primary"><?= $stats['devices'] ?></div>
                <div class="stat-label">Total Perangkat</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card border-success">
            <div class="stat-icon bg-success text-white"><i class="bi bi-wifi"></i></div>
            <div class="stat-data">
                <div class="stat-value text-success"><?= $stats['online'] ?></div>
                <div class="stat-label">Sedang Online</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card border-warning">
            <div class="stat-icon bg-warning text-dark"><i class="bi bi-calendar-check"></i></div>
            <div class="stat-data">
                <div class="stat-value text-warning"><?= $stats['schedules'] ?></div>
                <div class="stat-label">Jadwal Aktif</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card border-info">
            <div class="stat-icon bg-info text-dark"><i class="bi bi-journal-text"></i></div>
            <div class="stat-data">
                <div class="stat-value text-info"><?= $stats['logs_today'] ?></div>
                <div class="stat-label">Aksi Hari Ini</div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="admin-card">
            <div class="admin-card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-activity text-primary me-2"></i>Aktivitas Relay Terbaru</h5>
                <a href="/stopgo/admin/pages/logs.php" class="btn btn-sm btn-outline-secondary">Semua Log</a>
            </div>
            <div class="table-responsive">
                <table class="table table-dark table-hover mb-0 align-middle">
                    <thead class="text-secondary small">
                        <tr>
                            <th>Waktu</th>
                            <th>Perangkat</th>
                            <th>Aksi</th>
                            <th>Status Relay</th>
                            <th>Oleh</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <?php if(!$recentLogs): ?>
                            <tr><td colspan="5" class="text-center text-muted py-3">Belum ada aktivitas.</td></tr>
                        <?php endif; ?>
                        <?php foreach($recentLogs as $log): ?>
                        <tr>
                            <td class="text-muted"><?= date('H:i:s <br> d/m', strtotime($log['created_at'])) ?></td>
                            <td class="fw-medium text-light"><?= htmlspecialchars($log['device_name'] ?: 'Unknown') ?></td>
                            <td><span class="badge bg-dark border border-secondary"><?= htmlspecialchars($log['action']) ?></span></td>
                            <td>
                                <?php if($log['relay_status'] === 1): ?>
                                    <span class="text-success"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>ON</span>
                                <?php elseif($log['relay_status'] === 0): ?>
                                    <span class="text-danger"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>OFF</span>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td class="text-muted"><?= htmlspecialchars($log['source'] ?? 'Sistem') ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="admin-card text-center py-5">
            <img src="https://ui-avatars.com/api/?name=<?= urlencode($_SESSION['admin_name']) ?>&size=90&background=2d3748&color=fff" class="rounded-circle mb-3 shadow">
            <h5 class="fw-bold mb-1"><?= htmlspecialchars($_SESSION['admin_name']) ?></h5>
            <p class="text-muted small mb-4">@<?= htmlspecialchars($_SESSION['admin_username']) ?></p>
            
            <div class="d-flex justify-content-center gap-2">
                <a href="/stopgo/admin/pages/profile.php" class="btn btn-primary btn-sm"><i class="bi bi-person me-1"></i>Edit Profil</a>
                <a href="/stopgo/admin/logout.php" class="btn btn-danger btn-sm"><i class="bi bi-power me-1"></i>Keluar</a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
