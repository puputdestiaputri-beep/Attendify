<?php
/**
 * Admin — Manajemen Jadwal
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$pdo = Database::getConnection();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'delete') {
        $id = (int)$_POST['id'];
        $pdo->prepare("DELETE FROM schedules WHERE id = ?")->execute([$id]);
        adminLog($pdo, 'DELETE_SCHEDULE', "schedule_id=$id");
        $msg = 'Jadwal berhasil dihapus.';
    }

    if ($action === 'toggle_active') {
        $id = (int)$_POST['id'];
        $pdo->prepare("UPDATE schedules SET is_active = NOT is_active WHERE id = ?")->execute([$id]);
        adminLog($pdo, 'TOGGLE_SCHEDULE', "schedule_id=$id");
        $msg = 'Status jadwal berhasil diubah.';
    }
}

// Fetch schedules with device names
$schedules = $pdo->query("
    SELECT s.*, d.name AS device_name, d.device_key 
    FROM schedules s 
    LEFT JOIN devices d ON s.device_id = d.id 
    ORDER BY s.time_on ASC
")->fetchAll();

define('PAGE_TITLE', 'Manajemen Jadwal');
define('PAGE_ICON', 'bi-calendar-week');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

function getDaysLabel($days_json) {
    if (!$days_json) return 'Tidak ada';
    $days = json_decode($days_json, true);
    if (!is_array($days) || empty($days)) return 'Tidak ada';
    if (count($days) === 7) return '<span class="text-info fw-medium">Setiap Hari</span>';
    
    $map = [1=>'Sen', 2=>'Sel', 3=>'Rab', 4=>'Kam', 5=>'Jum', 6=>'Sab', 0=>'Min'];
    $labels = [];
    foreach($days as $d) $labels[] = $map[$d] ?? '?';
    return implode(', ', $labels);
}
?>

<div class="content-header mb-4">
    <h2 class="h4 fw-bold mb-1">Jadwal Otomatis</h2>
    <p class="text-muted small mb-0">Atur rutinitas nyala/mati untuk perangkat</p>
</div>

<?php if ($msg): ?>
<div class="alert alert-success alert-dismissible fade show mb-4 small" role="alert">
    <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($msg) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-clock-history text-warning me-2"></i>Daftar Jadwal Aktif (<?= count($schedules) ?>)</h5>
    </div>
    <div class="admin-card-body p-0">
        <div class="table-responsive p-3">
            <table class="table table-dark table-hover w-100" id="schedulesTable">
                <thead class="text-secondary small">
                    <tr>
                        <th>#</th>
                        <th>Nama Jadwal</th>
                        <th>Perangkat</th>
                        <th>Waktu (ON - OFF)</th>
                        <th>Hari Aktif</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody class="small align-middle">
                    <?php foreach ($schedules as $i => $s): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td class="fw-bold text-light"><?= htmlspecialchars($s['name']) ?></td>
                        <td>
                            <div class="text-light"><?= htmlspecialchars($s['device_name'] ?: 'Perangkat Dihapus') ?></div>
                            <code class="text-muted" style="font-size:0.7rem"><?= htmlspecialchars($s['device_key'] ?? '') ?></code>
                        </td>
                        <td>
                            <span class="text-success fw-bold"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i><?= substr($s['time_on'], 0, 5) ?></span>
                            <span class="text-muted mx-1">—</span>
                            <span class="text-secondary fw-bold"><i class="bi bi-circle me-1" style="font-size:0.5rem"></i><?= substr($s['time_off'], 0, 5) ?></span>
                        </td>
                        <td class="text-muted"><?= getDaysLabel($s['days_active']) ?></td>
                        <td>
                            <form method="POST">
                                <input type="hidden" name="action" value="toggle_active">
                                <input type="hidden" name="id" value="<?= $s['id'] ?>">
                                <button type="submit" class="btn btn-sm <?= $s['is_active'] ? 'btn-outline-success' : 'btn-outline-secondary' ?>">
                                    <?= $s['is_active'] ? '<i class="bi bi-check-circle-fill me-1"></i> Aktif' : '<i class="bi bi-dash-circle me-1"></i> Nonaktif' ?>
                                </button>
                            </form>
                        </td>
                        <td>
                            <form method="POST" class="d-inline" onsubmit="return confirm('Hapus jadwal ini?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $s['id'] ?>">
                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus"><i class="bi bi-trash3"></i></button>
                            </form>
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
    $('#schedulesTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/id.json' },
        pageLength: 25
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
