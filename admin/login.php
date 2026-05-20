<?php
session_start();
require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (!empty($_SESSION['admin_h_logged_in'])) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = $_POST['password'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (!verifyCSRFToken($token)) {
        $error = 'Sesi tidak valid, silakan muat ulang halaman.';
    } elseif ($user && $pass) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? AND is_active = 1");
        $stmt->execute([$user]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($pass, $admin['password'])) {
            $_SESSION['admin_h_logged_in'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_role'] = $admin['role'];
            
            // Update last login
            $ip = $_SERVER['REMOTE_ADDR'] === '::1' ? '127.0.0.1' : $_SERVER['REMOTE_ADDR'];
            $pdo->prepare("UPDATE admins SET last_login = NOW(), login_ip = ? WHERE id = ?")->execute([$ip, $admin['id']]);
            
            adminLog($pdo, 'LOGIN', '', 'Sukses Login');
            header('Location: index.php');
            exit;
        } else {
            $error = 'Username tidak ditemukan, password salah, atau akun nonaktif.';
            // Log failed attempt if username exists
            if ($admin) {
                adminLog($pdo, 'LOGIN_FAILED', '', 'Gagal Login: Password salah');
            }
        }
    } else {
        $error = 'Harap isi username dan password.';
    }
}
$csrf_token = generateCSRFToken();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login – Smart Absensi IoT</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        darkblue: '#0B1F3F',
                        primaryblue: '#1E4FA8',
                        highlightblue: '#2D6CDF',
                        glowpurple: '#6B46C1',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background: linear-gradient(135deg, #0B1F3F, #1E4FA8, #2D6CDF, #6B46C1);
            background-size: 200% 200%;
            animation: gradient-anim 10s ease infinite;
            color: #ffffff;
        }
        
        @keyframes gradient-anim {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .input-glass {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.3s ease;
        }

        .input-glass:focus {
            outline: none;
            border-color: #2D6CDF;
            box-shadow: 0 0 15px rgba(45, 108, 223, 0.5);
            background: rgba(0, 0, 0, 0.3);
        }

        .text-gradient {
            background: linear-gradient(to right, #60A5FA, #E9D5FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Avatar Animations */
        @keyframes float-avatar {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        .animate-avatar {
            animation: float-avatar 3s ease-in-out infinite;
        }

        /* Side Illustration Animations */
        @keyframes float-img {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
        }
        .animate-float-img {
            animation: float-img 5s ease-in-out infinite;
        }
        
        .pulse-core {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; transform: scale(1); filter: blur(40px); }
            50% { opacity: 1; transform: scale(1.2); filter: blur(50px); box-shadow: 0 0 30px rgba(45,108,223,0.4); }
        }
    </style>
</head>
<body class="min-h-screen font-sans flex items-center justify-center p-4 antialiased relative overflow-hidden">

    <!-- Ambient background glows -->
    <div class="absolute top-0 left-0 w-[400px] h-[400px] bg-highlightblue/30 rounded-full pulse-core -z-10 mix-blend-screen pointer-events-none"></div>
    <div class="absolute bottom-0 right-[-100px] w-[500px] h-[500px] bg-glowpurple/30 rounded-full pulse-core -z-10 mix-blend-screen pointer-events-none" style="animation-delay: 1s;"></div>

    <div class="w-full max-w-5xl flex flex-row rounded-3xl glass-card overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20">
        
        <!-- Left Side: Login Form -->
        <div class="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            
            <div class="absolute top-6 left-6">
                <a href="/absensi/" class="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors">
                    <i class="bi bi-arrow-left"></i> Kembali web
                </a>
            </div>

            <!-- Avatar -->
            <div class="flex justify-center mb-6 mt-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-primaryblue via-highlightblue to-glowpurple p-[3px] shadow-[0_0_20px_rgba(107,70,193,0.5)] animate-avatar">
                    <img src="https://api.dicebear.com/9.x/bottts/svg?seed=AbsensiAI&backgroundColor=1E4FA8,0B1F3F&radius=50" alt="Avatar" class="w-full h-full rounded-full object-cover bg-darkblue border-2 border-darkblue" />
                </div>
            </div>

            <!-- Headers -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold tracking-tight mb-2 text-white">Smart <span class="text-gradient">Absensi IoT</span></h1>
                <h2 class="text-lg font-semibold text-blue-200">Admin Dashboard</h2>
                <p class="text-xs text-blue-100/60 mt-2 font-medium tracking-wide uppercase">Sistem Absensi Berbasis Kamera IoT</p>
            </div>

            <!-- Error Message -->
            <?php if ($error): ?>
            <div class="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
                <i class="bi bi-exclamation-triangle-fill text-xl"></i>
                <span class="text-sm font-medium"><?= htmlspecialchars($error) ?></span>
            </div>
            <?php endif; ?>

            <!-- Form -->
            <form method="POST" class="space-y-5">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">
                
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-blue-100/80 uppercase tracking-wider ml-1">Username</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-highlightblue transition-colors">
                            <i class="bi bi-person-fill text-lg"></i>
                        </div>
                        <input type="text" name="username" class="w-full pl-11 pr-4 py-3.5 rounded-xl input-glass text-sm placeholder-white/30 font-medium" placeholder="Masukkan username admin" required autofocus autocomplete="off">
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-blue-100/80 uppercase tracking-wider ml-1">Password</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-highlightblue transition-colors">
                            <i class="bi bi-shield-lock-fill text-lg"></i>
                        </div>
                        <input type="password" name="password" id="loginPass" class="w-full pl-11 pr-12 py-3.5 rounded-xl input-glass text-sm placeholder-white/30 font-medium" placeholder="••••••••" required>
                        <button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors" onclick="togglePass()">
                            <i class="bi bi-eye-fill text-lg" id="eyeIcon"></i>
                        </button>
                    </div>
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full bg-highlightblue hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(45,108,223,0.4)] hover:shadow-[0_0_30px_rgba(45,108,223,0.7)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2">
                        <span>Masuk ke Dashboard Absensi</span>
                        <i class="bi bi-box-arrow-in-right"></i>
                    </button>
                </div>
            </form>

            <!-- Footer Small -->
            <div class="mt-8 text-center border-t border-white/10 pt-6">
                <p class="text-[0.65rem] text-white/40 font-semibold tracking-widest uppercase">&copy; Smart Absensi IoT</p>
                <p class="text-[0.65rem] text-white/30 mt-1">Camera Attendance System</p>
            </div>
        </div>

        <!-- Right Side: Large Illustration (Desktop Only) -->
        <div class="hidden lg:flex w-1/2 p-12 bg-darkblue relative flex-col items-center justify-center overflow-hidden border-l border-white/10">
            <!-- Grid Background Overlay -->
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 pointer-events-none opacity-50"></div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-darkblue via-transparent to-transparent z-10 pointer-events-none"></div>
            
            <div class="relative z-20 text-center w-full animate-float-img">
                <img src="/absensi/assets/img/maskot-login.png" alt="Smart Absensi AI Mascot" class="max-w-[85%] mx-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                
                <div class="absolute top-10 right-10 glass-card p-3 rounded-2xl shadow-xl animate-float" style="animation-delay: 1s;">
                    <i class="bi bi-camera-video-fill text-2xl text-highlightblue drop-shadow-[0_0_10px_rgba(45,108,223,0.8)]"></i>
                </div>
                
                <div class="absolute bottom-20 left-10 glass-card p-3 rounded-2xl shadow-xl animate-float">
                    <i class="bi bi-fingerprint text-2xl text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"></i>
                </div>
            </div>

            <div class="relative z-20 mt-8 text-center">
                <div class="inline-flex py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-widest uppercase border border-blue-500/30 mb-3 shadow-[0_0_15px_rgba(45,108,223,0.3)]">
                    <i class="bi bi-circle-fill text-[8px] animate-pulse mr-2"></i> Sistem Online
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Automatisasi Absensi</h3>
                <p class="text-blue-100/60 text-sm max-w-sm ml-auto mr-auto">Kelola data kehadiran menggunakan teknologi pengenalan wajah dari ESP32-CAM secara real-time.</p>
            </div>
        </div>
        
    </div>

    <script>
        function togglePass() {
            const input = document.getElementById('loginPass');
            const icon = document.getElementById('eyeIcon');
            if (input.type === 'password') {
                input.type = 'text'; 
                icon.className = 'bi bi-eye-slash-fill text-highlightblue';
            } else {
                input.type = 'password'; 
                icon.className = 'bi bi-eye-fill';
            }
        }
    </script>
</body>
</html>
