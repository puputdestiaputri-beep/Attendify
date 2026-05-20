<?php
/**
 * Admin — Profil Saya
 */
session_start();
require_once __DIR__ . '/../../api/config/database.php';
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$pdo = Database::getConnection();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        if ($name) {
            $pdo->prepare("UPDATE admins SET name=?, email=? WHERE id=?")->execute([$name, $email, $_SESSION['admin_id']]);
            $_SESSION['admin_name'] = $name;
            adminLog($pdo, 'UPDATE_PROFILE', '', 'Ubah nama/email');
            $msg = 'Profil berhasil diperbarui.';
        }
    }
    
    if ($action === 'change_password') {
        $curr = $_POST['current_pass'] ?? '';
        $new = $_POST['new_pass'] ?? '';
        $admin = $pdo->prepare("SELECT password FROM admins WHERE id=?");
        $admin->execute([$_SESSION['admin_id']]);
        $hash = $admin->fetchColumn();
        
        if (password_verify($curr, $hash) && strlen($new) >= 6) {
            $newHash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
            $pdo->prepare("UPDATE admins SET password=? WHERE id=?")->execute([$newHash, $_SESSION['admin_id']]);
            adminLog($pdo, 'CHANGE_PASSWORD', '', 'Ganti Password');
            $msg = 'Password berhasil diubah.';
        } else {
            $msg = 'Gagal ganti password. Cek password lama dan minimal 6 karakter.';
        }
    }
}

$admin = $pdo->prepare("SELECT * FROM admins WHERE id=?");
$admin->execute([$_SESSION['admin_id']]);
$user = $admin->fetch();

define('PAGE_TITLE', 'Profil Saya');
define('PAGE_ICON', 'bi-person-circle');
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';
?>

<div class="content-header mb-4">
    <h2 class="h4 fw-bold mb-1">Pengaturan Profil</h2>
    <p class="text-muted small mb-0">Ubah informasi akun dan kata sandi Anda.</p>
</div>

<?php if ($msg): ?>
<div class="alert alert-info alert-dismissible bg-dark border-info text-info fade show mb-4 small" role="alert">
    <i class="bi bi-info-circle-fill me-2"></i> <?= htmlspecialchars($msg) ?>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<div class="row g-4">
    <div class="col-md-6">
        <div class="admin-card">
            <div class="admin-card-header"><h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-person me-2"></i>Informasi Akun</h5></div>
            <div class="admin-card-body">
                <form method="POST">
                    <input type="hidden" name="action" value="update_profile">
                    <div class="mb-3">
                        <label class="form-label small text-muted">Username</label>
                        <input type="text" class="form-control bg-dark text-muted border-secondary" value="<?= htmlspecialchars($user['username']) ?>" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-muted">Role Akses</label>
                        <input type="text" class="form-control bg-dark text-muted border-secondary" value="<?= ucfirst($user['role']) ?>" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Nama Tampilan</label>
                        <input type="text" name="name" class="form-control bg-dark text-light border-secondary" value="<?= htmlspecialchars($user['name']) ?>" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-medium">Email Address</label>
                        <input type="email" name="email" class="form-control bg-dark text-light border-secondary" value="<?= htmlspecialchars($user['email'] ?? '') ?>">
                    </div>
                    <button type="submit" class="btn btn-primary w-100"><i class="bi bi-floppy me-2"></i>Simpan Perubahan</button>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="admin-card">
            <div class="admin-card-header"><h5 class="mb-0 fs-6 fw-bold"><i class="bi bi-shield-lock me-2 text-warning"></i>Ganti Password</h5></div>
            <div class="admin-card-body">
                <form method="POST">
                    <input type="hidden" name="action" value="change_password">
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Password Saat Ini</label>
                        <input type="password" name="current_pass" class="form-control bg-dark text-light border-secondary" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Password Baru <span class="text-muted">(min 6 karakter)</span></label>
                        <input type="password" name="new_pass" class="form-control bg-dark text-light border-secondary" minlength="6" required>
                    </div>
                    <button type="submit" class="btn btn-warning w-100 mt-3"><i class="bi bi-key me-2"></i>Perbarui Password</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
