<?php
/**
 * Admin — Logs
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'purge') {
        $days = (int)($_POST['days'] ?? 30);
        $pdo->prepare("DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)")->execute([$days]);
        adminLog($pdo, 'PURGE_LOGS', '', "Purge log older than $days days");
    }
}

// Fetch logs (limit 1000 to prevent crash)
$logs = $pdo->query("
    SELECT l.*, d.name AS device_name 
    FROM logs l 
    LEFT JOIN devices d ON l.device_id = d.id 
    ORDER BY l.created_at DESC 
    LIMIT 1000
")->fetchAll();

define('PAGE_TITLE', 'Log Aktivitas Relay');
define('PAGE_ICON', 'bi-journal-text');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
?>

<div class="content-header d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="h4 fw-bold mb-1">Log Aktivitas</h2>
        <p class="text-muted small mb-0">Riwayat kontrol relay ON/OFF dari semua sumber (maks. 1000 data terbaru)</p>
    </div>
    <form method="POST" onsubmit="return confirm('Hapus semua log yang usianya lebih dari 30 hari?');">
        <input type="hidden" name="action" value="purge">
        <input type="hidden" name="days" value="30">
        <button type="submit" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash3 me-1"></i> Bersihkan Log Lama</button>
    </form>
</div>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-clock-history text-info me-2"></i>Histori (<?= count($logs) ?>)</h5>
    </div>
    <div class="admin-card-body p-0">
        <div class="table-responsive p-3">
            <table class="table table-dark table-hover w-100" id="logsTable">
                <thead class="text-secondary small">
                    <tr>
                        <th>#</th>
                        <th>Waktu</th>
                        <th>Perangkat</th>
                        <th>Aksi</th>
                        <th>Relay</th>
                        <th>Sumber (IP / Web)</th>
                    </tr>
                </thead>
                <tbody class="small align-middle">
                    <?php foreach ($logs as $i => $l): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td><?= date('d/m/Y H:i:s', strtotime($l['created_at'])) ?></td>
                        <td class="fw-bold text-light"><?= htmlspecialchars($l['device_name'] ?: 'Unknown') ?></td>
                        <td><span class="badge border border-secondary text-secondary bg-dark"><?= htmlspecialchars($l['action']) ?></span></td>
                        <td>
                            <?php if ($l['relay_status'] === 1): ?>
                                <span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-power"></i> ON</span>
                            <?php elseif ($l['relay_status'] === 0): ?>
                                <span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-power"></i> OFF</span>
                            <?php else: ?>
                                <span class="text-muted">—</span>
                            <?php endif; ?>
                        </td>
                        <td class="text-muted">
                            <?= htmlspecialchars($l['source'] ?? '-') ?>
                            <?php if (!empty($l['ip_address'])): ?>
                                <br><code style="font-size:0.65rem"><?= htmlspecialchars($l['ip_address']) ?></code>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#logsTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/id.json' },
        order: [[1, 'desc']],
        pageLength: 50
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
