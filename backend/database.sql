CREATE DATABASE db_absensi;
USE db_absensi;

-- =========================
-- TABEL WAJAH
-- =========================
CREATE TABLE wajah (
    id_wajah INT AUTO_INCREMENT PRIMARY KEY,
    foto1 VARCHAR(200),
    foto2 VARCHAR(200),
    foto3 VARCHAR(200),
    foto4 VARCHAR(200),
    tanggal_input DATETIME
);

-- =========================
-- TABEL PENGGUNA
-- =========================
CREATE TABLE pengguna (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100),
    email VARCHAR(100),
    username VARCHAR(20),
    password VARCHAR(200),
    role ENUM('admin','dosen','mahasiswa'),
    id_wajah INT,
    status ENUM('Y','N'),
    prodi VARCHAR(100),
    kelas VARCHAR(50),
    foto_profil LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_wajah) REFERENCES wajah(id_wajah)
);

-- =========================
-- TABEL KELAS
-- =========================
CREATE TABLE kelas (
    id_kelas INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(50),
    prodi ENUM('informatika','sistem informasi','teknologi informasi'),
    keterangan VARCHAR(100)
);

-- =========================
-- TABEL MAHASISWA_KELAS
-- =========================
CREATE TABLE mahasiswa_kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id INT,
    kelas_id INT,

    FOREIGN KEY (mahasiswa_id) REFERENCES pengguna(id_user),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id_kelas)
);

-- =========================
-- TABEL KAMERA
-- =========================
CREATE TABLE kamera (
    id_kamera INT AUTO_INCREMENT PRIMARY KEY,
    nama_kamera VARCHAR(50),
    lokasi_kelas VARCHAR(100),
    ip_address VARCHAR(50),
    status ENUM('aktif','nonaktif')
);

-- =========================
-- TABEL MATA KULIAH
-- =========================
CREATE TABLE mata_kuliah (
    id_mk INT AUTO_INCREMENT PRIMARY KEY,
    kode_mk VARCHAR(10),
    nama_mk VARCHAR(100),
    sks INT,
    status ENUM('Y','N')
);

-- =========================
-- TABEL JADWAL KULIAH
-- =========================
CREATE TABLE jadwal_kuliah (
    id_jadwal INT AUTO_INCREMENT PRIMARY KEY,
    dosen_id INT,
    mata_kuliah_id INT,
    kelas_id INT,
    hari ENUM('senin','selasa','rabu','kamis','jumat','sabtu'),
    jam_mulai TIME,
    jam_selesai TIME,
    ruang VARCHAR(50),

    FOREIGN KEY (dosen_id) REFERENCES pengguna(id_user),
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id_mk),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id_kelas)
);

-- =========================
-- TABEL ABSENSI
-- =========================
CREATE TABLE absensi (
    id_absensi INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    kamera_id INT,
    jadwal_id INT,
    tanggal DATETIME,
    waktu_datang TIME,
    status ENUM('hadir','terlambat','pulang','alfa','sakit','izin'),
    status_telat ENUM('ya','tidak'),
    keterangan VARCHAR(100),
    submitted_by_role ENUM('dosen', 'admin', 'system') DEFAULT 'system',

    FOREIGN KEY (user_id) REFERENCES pengguna(id_user),
    FOREIGN KEY (kamera_id) REFERENCES kamera(id_kamera),
    FOREIGN KEY (jadwal_id) REFERENCES jadwal_kuliah(id_jadwal)
);

-- =========================
-- TABEL Laporan (Reports)
-- =========================
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    role VARCHAR(50),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user)
);

-- =========================
-- TABEL LOG DETEKSI WAJAH
-- =========================
CREATE TABLE log_deteksi (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    kamera_id INT,
    user_id INT,
    waktu_deteksi DATETIME,
    confidence FLOAT,
    foto_capture VARCHAR(200),

    FOREIGN KEY (kamera_id) REFERENCES kamera(id_kamera),
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user)
);

-- =========================
-- TABEL NOTIFIKASI
-- =========================
CREATE TABLE notifikasi (
    id_notif INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    judul VARCHAR(100),
    jenis_notif ENUM('absensi','terlambat','informasi'),
    pesan TEXT,
    tanggal DATETIME,
    status_baca ENUM('belum','sudah'),

    FOREIGN KEY (user_id) REFERENCES pengguna(id_user)
);