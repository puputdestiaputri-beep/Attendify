<?php
/**
 * Admin — Log Aktivitas Administrator
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();
requireRole('superadmin'); // Only superadmin

$pdo = Database::getConnection();

$logs = $pdo->query("
    SELECT al.*, a.name AS admin_name, a.username 
    FROM admin_logs al 
    LEFT JOIN admins a ON al.admin_id = a.id 
    ORDER BY al.created_at DESC LIMIT 500
")->fetchAll();

define('PAGE_TITLE', 'Audit Trail Admin');
define('PAGE_ICON', 'bi-shield-check');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
?>

<div class="content-header mb-4">
    <h2 class="h4 fw-bold mb-1">Audit Trail Administrator</h2>
    <p class="text-muted small mb-0">Riwayat segala bentuk aktivitas admin panel (max 500 records)</p>
</div>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-shield-lock text-info me-2"></i>Log Admin Panel</h5>
    </div>
    <div class="admin-card-body p-0">
        <div class="table-responsive p-3">
            <table class="table table-dark table-hover w-100" id="adminLogsTable">
                <thead class="text-secondary small">
                    <tr>
                        <th>#</th>
                        <th>Waktu</th>
                        <th>Administrator</th>
                        <th>Aksi / Modul</th>
                        <th>Target</th>
                        <th>IP Address</th>
                        <th>Detail Opsional</th>
                    </tr>
                </thead>
                <tbody class="small align-middle">
                    <?php foreach ($logs as $i => $l): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td class="text-nowrap text-muted"><?= date('d/m/Y H:i:s', strtotime($l['created_at'])) ?></td>
                        <td>
                            <div class="fw-bold text-light"><?= htmlspecialchars($l['admin_name'] ?: 'Admin Terhapus') ?></div>
                            <div class="text-muted" style="font-size:0.75rem">@<?= htmlspecialchars($l['username'] ?? 'unknown') ?></div>
                        </td>
                        <td><span class="badge border border-info text-info bg-dark"><?= htmlspecialchars($l['action']) ?></span></td>
                        <td class="text-secondary"><?= htmlspecialchars($l['target'] ?: '-') ?></td>
                        <td><code style="font-size:0.75rem"><?= htmlspecialchars($l['ip_address'] ?? '0.0.0.0') ?></code></td>
                        <td class="text-muted"><?= htmlspecialchars($l['detail'] ?: '-') ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#adminLogsTable').DataTable({ 
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/id.json' },
        order: [[1, 'desc']],
        pageLength: 25
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
