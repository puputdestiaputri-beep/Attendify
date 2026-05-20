<?php
/**
 * Admin — Manajemen Perangkat
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../../api/models/Device.php';
require_once __DIR__ . '/../../api/models/Log.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$pdo = Database::getConnection();
$deviceModel = new Device();
$logModel = new Log();
$deviceModel->markOfflineAll();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Handle Delete
    if ($action === 'delete') {
        $id = (int)$_POST['id'];
        $pdo->prepare("DELETE FROM devices WHERE id = ?")->execute([$id]);
        adminLog($pdo, 'DELETE_DEVICE', "device_id=$id");
        $msg = 'Perangkat berhasil dihapus.';
    }

    // Handle Toggle Relay (manual control from admin panel)
    if ($action === 'toggle_relay') {
        $id = (int)$_POST['id'];
        $stmt = $pdo->prepare("SELECT relay_status FROM devices WHERE id = ?");
        $stmt->execute([$id]);
        $device = $stmt->fetch();
        if ($device) {
            $new_status = $device['relay_status'] ? 0 : 1;
            $pdo->prepare("UPDATE devices SET relay_status = ? WHERE id = ?")->execute([$new_status, $id]);
            
            $action_str = $new_status ? 'ON' : 'OFF';
            $logModel->insert($id, $action_str, 'manual', $new_status, $_SERVER['REMOTE_ADDR'], 'Toggle via admin panel');
            adminLog($pdo, 'TOGGLE_RELAY', "device_id=$id", "Set relay=" . ($new_status ? 'ON' : 'OFF'));
            $msg = 'Status relay berhasil diubah.';
        }
    }
}

// Fetch all devices
$devices = $pdo->query("SELECT * FROM devices ORDER BY name ASC")->fetchAll();

define('PAGE_TITLE', 'Manajemen Perangkat');
define('PAGE_ICON', 'bi-cpu-fill');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
?>

<div class="content-header d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="h4 fw-bold mb-1">Perangkat ESP32</h2>
        <p class="text-muted small mb-0">Kelola semua perangkat yang terhubung ke sistem</p>
    </div>
    <a href="/stopgo/" class="btn btn-primary btn-sm"><i class="bi bi-display me-1"></i> Buka Landing Page</a>
</div>

<?php if ($msg): ?>
<div class="alert alert-success alert-dismissible fade show mb-4 small" role="alert">
    <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($msg) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-list-ul me-2 text-primary"></i>Daftar Perangkat (<?= count($devices) ?>)</h5>
    </div>
    <div class="admin-card-body p-0">
        <div class="table-responsive p-3">
            <table class="table table-dark table-hover w-100" id="devicesTable">
                <thead class="text-secondary small">
                    <tr>
                        <th>#</th>
                        <th>Nama Perangkat</th>
                        <th>Lokasi</th>
                        <th>Status</th>
                        <th>Relay</th>
                        <th>Last Seen</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody class="small align-middle">
                    <?php foreach ($devices as $i => $dev): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td>
                            <div class="fw-bold text-light"><?= htmlspecialchars($dev['name']) ?></div>
                            <code class="text-secondary" style="font-size:0.7rem"><?= htmlspecialchars($dev['device_key']) ?></code>
                        </td>
                        <td class="text-muted"><?= htmlspecialchars($dev['location'] ?: '-') ?></td>
                        <td>
                            <?php if ($dev['is_online']): ?>
                                <span class="badge bg-success-subtle border border-success text-success"><i class="bi bi-wifi me-1"></i>Online</span>
                            <?php else: ?>
                                <span class="badge bg-danger-subtle border border-danger text-danger"><i class="bi bi-wifi-off me-1"></i>Offline</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <form method="POST" class="d-inline">
                                <input type="hidden" name="action" value="toggle_relay">
                                <input type="hidden" name="id" value="<?= $dev['id'] ?>">
                                <?php if ($dev['relay_status']): ?>
                                    <button type="submit" class="btn btn-sm btn-success" title="Matikan Relay"><i class="bi bi-power"></i> ON</button>
                                <?php else: ?>
                                    <button type="submit" class="btn btn-sm btn-danger" title="Nyalakan Relay"><i class="bi bi-power"></i> OFF</button>
                                <?php endif; ?>
                            </form>
                        </td>
                        <td class="text-muted" style="font-size:0.75rem">
                            <?= $dev['last_seen'] ? date('d M Y, H:i:s', strtotime($dev['last_seen'])) : 'Belum pernah' ?>
                        </td>
                        <td>
                            <form method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus perangkat ini? Semua jadwal dan log terkait akan terhapus.');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $dev['id'] ?>">
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
    $('#devicesTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/id.json' },
        pageLength: 25
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
