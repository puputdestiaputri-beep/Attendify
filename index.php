<?php
/**
 * Landing Page — Smart Absensi IoT
 * Theme: Tailwind Modern Futuristic
 */

// Fetch live stats dari API database
$stats = ['total_devices' => 0, 'online_devices' => 0, 'active_relays' => 0, 'today_logs' => 0];
try {
    require_once __DIR__ . '/api/config/database.php';
    require_once __DIR__ . '/api/models/Device.php';
    $deviceModel = new Device();
    $deviceModel->markOfflineAll();
    $pdo = Database::getConnection();
    $row = $pdo->query("SELECT COUNT(*) AS t, SUM(is_online) AS o, SUM(relay_status) AS a FROM devices")->fetch();
    $stats['total_devices']  = (int)($row['t'] ?? 0);
    $stats['online_devices'] = (int)($row['o'] ?? 0);
    $stats['active_relays']  = (int)($row['a'] ?? 0);
    $stats['today_logs']     = (int)$pdo->query("SELECT COUNT(*) FROM logs WHERE DATE(created_at)=CURDATE()")->fetchColumn();
} catch (Exception $e) {}
$year = date('Y');
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IoT Smart Absensi Kamera</title>

  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

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
      background-attachment: fixed;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      color: #ffffff;
    }
    .glass-nav {
      background: rgba(11, 31, 63, 0.4);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .text-gradient {
      background: linear-gradient(to right, #60A5FA, #C084FC); /* Tailwind blue-400 to purple-400 */
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .text-gradient-alt {
      background: linear-gradient(to right, #93C5FD, #E9D5FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Custom Animations for Hero Section */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes float-delay {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float-delay {
      animation: float-delay 3.5s ease-in-out infinite 1s;
    }

    @keyframes scan-line {
      0% { top: 0; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .animate-scan {
      animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 20px 5px rgba(45,108,223,0.5); }
    }
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    /* Faster animation on hover */
    .group:hover .animate-float {
      animation-duration: 2s;
    }
    .group:hover .animate-float-delay {
      animation-duration: 1.5s;
    }
    .group:hover .animate-scan {
      animation-duration: 1.2s;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">

  <!-- Navbar -->
  <nav class="glass-nav fixed w-full z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <a href="/absensi/" class="flex items-center gap-3 group">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-highlightblue to-glowpurple flex items-center justify-center text-white shadow-[0_0_15px_rgba(45,108,223,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(45,108,223,0.8)] transition-all duration-300">
            <i class="bi bi-camera-video-fill text-xl"></i>
          </div>
          <div>
            <div class="font-bold text-xl leading-tight tracking-wide">Smart Absensi</div>
            <div class="text-[0.65rem] text-blue-200/80 font-bold uppercase tracking-widest mt-0.5">Camera Attendance System</div>
          </div>
        </a>
        <div class="hidden md:flex items-center gap-8">
          <a href="#fitur" class="text-sm font-semibold text-blue-100/80 hover:text-white transition-colors">Fitur Utama</a>
          <a href="/absensi/admin/" class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primaryblue to-glowpurple text-white text-sm font-bold shadow-[0_4_14px_rgba(107,70,193,0.4)] hover:scale-105 hover:shadow-[0_6_20px_rgba(107,70,193,0.6)] transition-all duration-300 flex items-center gap-2">
            <i class="bi bi-shield-lock-fill"></i> Login
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex-grow flex items-center">
    <!-- Decorative Glow Effects -->
    <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-highlightblue/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glowpurple/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <!-- Hero Text -->
        <div class="w-full lg:w-1/2">
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card text-[0.7rem] font-bold text-blue-200 tracking-widest uppercase mb-6 shadow-xl border border-white/20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            IoT Camera Attendance System
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-[1.1] drop-shadow-lg">
            Sistem Absensi Pintar Berbasis <br class="hidden md:block">
            <span class="text-gradient">Kamera IoT</span>
          </h1>
          
          <h2 class="text-xl md:text-2xl font-bold text-blue-200/90 mb-6 drop-shadow-md">
            Smart Attendance Monitoring
          </h2>
          
          <p class="text-base md:text-lg text-blue-100/80 mb-10 max-w-xl leading-relaxed font-medium">
            Sistem absensi otomatis menggunakan kamera IoT seperti ESP32-CAM atau AI Camera untuk mendeteksi kehadiran secara real-time dengan dashboard monitoring modern.
          </p>
          
          <div class="flex flex-wrap gap-4">
            <a href="/absensi/admin/login.php" class="px-8 py-4 rounded-xl bg-white text-darkblue font-bold text-base hover:scale-105 hover:bg-blue-50 shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center gap-3">
              <i class="bi bi-grid-1x2-fill"></i> Buka Dashboard Absensi
            </a>
          </div>
        </div>

        <!-- Hero Image with Animations -->
        <div class="w-full lg:w-1/2 relative group px-6 lg:px-0 mt-8 lg:mt-0">
          <div class="absolute inset-0 bg-highlightblue/20 rounded-full blur-[80px] -z-10 group-hover:bg-highlightblue/40 transition-all duration-500"></div>
          
          <!-- Main Illustration Container (Floating) -->
          <div class="relative animate-float z-10 mx-auto max-w-[350px] lg:max-w-[420px]">
            <img src="/absensi/assets/img/maskot-landing.png" alt="Ilustrasi Smart Absensi IoT" class="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500 will-change-transform" />
            
            <!-- IoT Camera Scan Effect Overlay -->
            <div class="absolute top-[30%] left-[20%] w-[35%] h-[40%] rounded-lg border-2 border-transparent overflow-hidden z-20 pointer-events-none">
              <div class="absolute left-0 right-0 h-0.5 bg-highlightblue shadow-[0_0_10px_2px_rgba(45,108,223,0.8)] animate-scan"></div>
            </div>
            
            <!-- Hologram Face Frame & Checkmark -->
            <div class="absolute top-[20%] left-[25%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
               <div class="w-16 h-16 border border-green-400 rounded-lg relative">
                 <div class="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-green-400"></div>
                 <div class="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-green-400"></div>
                 <div class="absolute inset-0 flex items-center justify-center">
                    <i class="bi bi-check-circle-fill text-green-400 text-xl drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-bounce"></i>
                 </div>
               </div>
            </div>

            <!-- Floating AI Cloud Icon -->
            <div class="absolute -top-5 right-[15%] glass-card p-3 rounded-2xl animate-float-delay z-20 border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.3)] group-hover:border-highlightblue/50 transition-colors">
              <i class="bi bi-cloud-arrow-up-fill text-2xl text-highlightblue drop-shadow-[0_0_10px_rgba(45,108,223,0.6)]"></i>
            </div>

            <!-- Floating Data Icon -->
            <div class="absolute bottom-[20%] -left-5 glass-card p-3 p-4 rounded-xl animate-float-delay z-20 border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.3)] group-hover:border-glowpurple/50 transition-colors" style="animation-delay: 1.5s;">
              <i class="bi bi-database-fill-up text-xl text-glowpurple drop-shadow-[0_0_10px_rgba(107,70,193,0.6)] animate-pulse-glow"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <div class="border-y border-white/10 glass-nav py-10 relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
        
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 group px-4">
          <div class="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="bi bi-camera"></i>
          </div>
          <div class="text-center md:text-left">
            <div class="text-4xl font-black drop-shadow-md text-white"><?= $stats['total_devices'] ?></div>
            <div class="text-[0.65rem] text-blue-200/70 uppercase tracking-widest font-bold mt-1">Total Kamera</div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 group px-4">
          <div class="w-14 h-14 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="bi bi-wifi"></i>
          </div>
          <div class="text-center md:text-left">
            <div class="text-4xl font-black drop-shadow-md text-green-400"><?= $stats['online_devices'] ?></div>
            <div class="text-[0.65rem] text-blue-200/70 uppercase tracking-widest font-bold mt-1">Kamera Online</div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 group px-4 border-t md:border-t-0 border-white/10 pt-8 md:pt-0 mt-8 md:mt-0">
          <div class="w-14 h-14 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="text-center md:text-left">
            <div class="text-4xl font-black drop-shadow-md text-purple-300"><?= $stats['active_relays'] ?></div>
            <div class="text-[0.65rem] text-blue-200/70 uppercase tracking-widest font-bold mt-1">Absensi Hari Ini</div>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-4 group px-4 border-t md:border-t-0 border-white/10 pt-8 md:pt-0 mt-8 md:mt-0">
          <div class="w-14 h-14 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="bi bi-journal-check"></i>
          </div>
          <div class="text-center md:text-left">
            <div class="text-4xl font-black drop-shadow-md text-yellow-300"><?= $stats['today_logs'] ?></div>
            <div class="text-[0.65rem] text-blue-200/70 uppercase tracking-widest font-bold mt-1">Log Absensi Hari Ini</div>
          </div>
        </div>
        
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <section id="fitur" class="py-28 relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 max-w-2xl mx-auto">
        <div class="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-bold text-highlightblue tracking-widest uppercase mb-4 border border-highlightblue/30 shadow-lg">
          Fitur Unggulan
        </div>
        <h2 class="text-3xl md:text-4xl font-bold drop-shadow-md mb-4">Semua yang Kamu Butuhkan</h2>
        <p class="text-blue-100/70 font-medium">Sistem absensi berbasis IoT terdepan dengan kemampuan pengolahan citra dan sinkronisasi real-time.</p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Feature 1 -->
        <div class="glass-card rounded-2xl p-8 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-highlightblue/60 transition-all duration-300 group">
          <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl text-highlightblue mb-6 group-hover:scale-110 group-hover:bg-highlightblue group-hover:text-white group-hover:shadow-[0_0_20px_rgba(45,108,223,0.5)] transition-all duration-300 border border-white/10">
            <i class="bi bi-camera"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Monitoring Absensi Realtime</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed font-medium">Pantau kehadiran siswa atau karyawan secara langsung melalui dashboard IoT.</p>
        </div>

        <!-- Feature 2 -->
        <div class="glass-card rounded-2xl p-8 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-glowpurple/60 transition-all duration-300 group">
          <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl text-glowpurple mb-6 group-hover:scale-110 group-hover:bg-glowpurple group-hover:text-white group-hover:shadow-[0_0_20px_rgba(107,70,193,0.5)] transition-all duration-300 border border-white/10">
            <i class="bi bi-person-check"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Face Recognition Kamera</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed font-medium">Sistem kamera mengenali wajah secara otomatis untuk mencatat absensi.</p>
        </div>

        <!-- Feature 3 -->
        <div class="glass-card rounded-2xl p-8 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-blue-400/60 transition-all duration-300 group">
          <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-400 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(96,165,250,0.5)] transition-all duration-300 border border-white/10">
            <i class="bi bi-speedometer2"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Dashboard Admin Absensi</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed font-medium">Kelola pengguna, perangkat kamera, dan laporan absensi secara lengkap.</p>
        </div>
        
        <!-- Feature 4 -->
        <div class="glass-card rounded-2xl p-8 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-green-400/60 transition-all duration-300 group">
          <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl text-green-400 mb-6 group-hover:scale-110 group-hover:bg-green-400 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all duration-300 border border-white/10">
            <i class="bi bi-cloud-arrow-up"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">Cloud Attendance Data</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed font-medium">Data absensi tersimpan otomatis di database dan dapat diakses kapan saja.</p>
        </div>

      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="mt-auto glass-nav border-t border-white/10 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="inline-flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
        <i class="bi bi-shield-check"></i>
        <span>&copy; <?= $year ?> Smart Absensi IoT – Camera Attendance System using ESP32-CAM.</span>
      </div>
    </div>
  </footer>

</body>
</html>
