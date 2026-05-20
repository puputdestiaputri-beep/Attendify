<?php
/**
 * Admin — Manajemen Akun Admin
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();
requireRole('superadmin'); // Only superadmin

$pdo = Database::getConnection();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $username = trim($_POST['username'] ?? '');
        $name     = trim($_POST['name'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $role     = in_array($_POST['role'] ?? '', ['admin','superadmin']) ? $_POST['role'] : 'admin';
        $pass     = $_POST['password'] ?? '';
        
        if ($username && $name && strlen($pass) >= 6) {
            try {
                $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
                $pdo->prepare("INSERT INTO admins (username, password, name, email, role) VALUES (?,?,?,?,?)")
                    ->execute([$username, $hash, $name, $email, $role]);
                adminLog($pdo, 'ADD_ADMIN', "username=$username");
                $msg = 'Akun admin berhasil ditambahkan.';
            } catch (PDOException $e) {
                $msg = 'Gagal menambah admin. Pastikan username belum dipakai.';
            }
        } else {
            $msg = 'Data tidak lengkap atau password kurang dari 6 karakter.';
        }
    }
    
    if ($action === 'delete') {
        $id = (int)$_POST['id'];
        if ($id !== (int)$_SESSION['admin_id']) {
            $pdo->prepare("DELETE FROM admins WHERE id = ?")->execute([$id]);
            adminLog($pdo, 'DELETE_ADMIN', "admin_id=$id");
            $msg = 'Akun admin berhasil dihapus.';
        } else {
            $msg = 'Tidak dapat menghapus akun Anda sendiri.';
        }
    }
}

$admins = $pdo->query("SELECT * FROM admins ORDER BY role DESC, name ASC")->fetchAll();

define('PAGE_TITLE', 'Kelola Administrator');
define('PAGE_ICON', 'bi-people');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
?>

<div class="content-header d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="h4 fw-bold mb-1">Daftar Admin</h2>
        <p class="text-muted small mb-0">Kelola akun administrator sistem (Superadmin Only)</p>
    </div>
    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalAddAdmin">
        <i class="bi bi-person-plus me-1"></i> Tambah Admin
    </button>
</div>

<?php if ($msg): ?>
<div class="alert alert-info alert-dismissible fade show mb-4 small" role="alert">
    <i class="bi bi-info-circle-fill me-2"></i> <?= htmlspecialchars($msg) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-people text-warning me-2"></i>Admin Terdaftar</h5>
    </div>
    <div class="admin-card-body p-0">
        <div class="table-responsive p-3">
            <table class="table table-dark table-hover w-100" id="adminsTable">
                <thead class="text-secondary small">
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Nama & Email</th>
                        <th>Role</th>
                        <th>Last Login</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody class="small align-middle">
                    <?php foreach ($admins as $i => $a): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td><code><?= htmlspecialchars($a['username']) ?></code></td>
                        <td>
                            <div class="fw-bold text-light"><?= htmlspecialchars($a['name']) ?></div>
                            <div class="text-muted" style="font-size:0.75rem"><?= htmlspecialchars($a['email'] ?: 'Tidak ada email') ?></div>
                        </td>
                        <td>
                            <?php if ($a['role'] === 'superadmin'): ?>
                                <span class="badge bg-danger-subtle text-danger border border-danger">Superadmin</span>
                            <?php else: ?>
                                <span class="badge bg-primary-subtle text-primary border border-primary">Admin</span>
                            <?php endif; ?>
                            <?php if ($a['id'] === $_SESSION['admin_id']): ?>
                                <span class="badge bg-success ms-1">Anda</span>
                            <?php endif; ?>
                        </td>
                        <td class="text-muted" style="font-size:0.75rem">
                            <?= $a['last_login'] ? date('d/m/y H:i', strtotime($a['last_login'])) : 'Belum Pernah' ?>
                        </td>
                        <td>
                            <?php if ($a['id'] !== $_SESSION['admin_id']): ?>
                            <form method="POST" class="d-inline" onsubmit="return confirm('Hapus admin ini?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $a['id'] ?>">
                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus"><i class="bi bi-trash3"></i></button>
                            </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal -->
<div class="modal fade" id="modalAddAdmin" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title"><i class="bi bi-person-plus me-2 text-primary"></i>Tambah Akun</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                <div class="modal-body border-secondary">
                    <div class="mb-3">
                        <label class="form-label small">Nama Lengkap</label>
                        <input type="text" name="name" class="form-control bg-dark text-light border-secondary" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Username</label>
                        <input type="text" name="username" class="form-control bg-dark text-light border-secondary" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Email (Opsional)</label>
                        <input type="email" name="email" class="form-control bg-dark text-light border-secondary">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Role</label>
                        <select name="role" class="form-select bg-dark text-light border-secondary">
                            <option value="admin">Admin Biasa</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Password Minimal 6 karakter</label>
                        <input type="password" name="password" minlength="6" class="form-control bg-dark text-light border-secondary" required>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="bi bi-floppy me-1"></i> Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#adminsTable').DataTable({ language: { url: '//cdn.datatables.net/plug-ins/1.13.8/i18n/id.json' }});
});
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
