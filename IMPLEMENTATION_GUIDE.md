# 📋 Dokumentasi: Fitur Jadwal Perkuliahan & Download Laporan Absensi

## ✅ VERIFIKASI IMPLEMENTASI

### 1️⃣ Struktur Data Absensi
**Status:** ✅ SIAP

Data absensi sudah membedakan status mahasiswa per mata kuliah:
- ✅ **Hadir** - Mahasiswa hadir tepat waktu
- ⏱️ **Terlambat** - Mahasiswa hadir tapi terlambat (>15 menit)
- 🏥 **Sakit** - Mahasiswa tidak hadir karena sakit
- 📝 **Izin** - Mahasiswa tidak hadir karena izin
- ❌ **Alfa** - Mahasiswa tidak hadir tanpa keterangan

**Database Schema:**
```sql
CREATE TABLE absensi (
    id_absensi INT PRIMARY KEY,
    user_id INT,
    jadwal_id INT,
    tanggal DATETIME,
    waktu_datang TIME,
    status ENUM('hadir','terlambat','pulang','alfa','sakit','izin'),
    keterangan VARCHAR(100),
    ...
)
```

**Backend Support:**
- ✅ `absensiController.js` - Mendukung semua status
- ✅ `updateAttendanceStatus` endpoint - Bisa update status apapun
- ✅ Database migration file - `migrations/001_add_status_absensi.sql`

---

### 2️⃣ Endpoint Download Laporan
**Status:** ✅ SIAP

**Routes yang tersedia:**

```javascript
// GET /api/reports/excel?jadwal_id=ID
// GET /api/reports/pdf?jadwal_id=ID
```

**Parameter yang didukung:**
- `jadwal_id` (required) - ID mata kuliah untuk filter laporan
- `class_id` (optional) - ID kelas untuk filter
- `date` (optional) - Tanggal spesifik (format: YYYY-MM-DD)

**Features:**
- ✅ Export ke Excel (.xlsx) dengan format profesional
- ✅ Export ke PDF dengan tabel dan summary
- ✅ Include informasi: Mata Kuliah, Kelas, Dosen, Ruangan
- ✅ Daftar mahasiswa grouped by status (Hadir, Terlambat, Sakit, Izin, Alfa)
- ✅ Color-coded status untuk visual clarity
- ✅ Automatic filename generation dengan timestamp

**Backend Implementation:**
- ✅ `reportController.js` - Fungsi exportExcel() dan exportPDF()
- ✅ Support parameter `jadwal_id` untuk filter per mata kuliah
- ✅ Query dengan JOIN ke 5 tabel (absensi, pengguna, jadwal, matkul, kelas)
- ✅ Error handling untuk data kosong

---

### 3️⃣ Frontend Flow
**Status:** ✅ IMPLEMENTASI LENGKAP

#### Flow User:

```
Admin View "Per Kelas"
    ↓
[Klik Kelas] 
    ↓
Modal 1: Daftar Mata Kuliah (Per Minggu)
├─ Menampilkan: 
│  ├─ Nama Mata Kuliah
│  ├─ Nama Dosen Pengampu
│  ├─ Hari & Jam Kuliah
│  └─ [Clickable]
    ↓
[Klik Mata Kuliah]
    ↓
Modal 2: Detail Mata Kuliah & Daftar Mahasiswa
├─ Info Mata Kuliah:
│  ├─ Nama Mata Kuliah
│  ├─ Dosen Pengampu 👨‍🏫
│  ├─ Ruangan 🏛️
│  └─ Waktu Kuliah ⏰
├─ Daftar Mahasiswa (Grouped by Status):
│  ├─ ✅ Hadir (hijau)
│  ├─ ⏱️ Terlambat (kuning)
│  ├─ 🏥 Sakit (ungu)
│  ├─ 📝 Izin (cyan)
│  └─ ❌ Alfa (merah)
└─ Action Buttons:
   ├─ [Excel] → Download laporan
   └─ [PDF] → Download laporan
```

#### State Management:

```typescript
// Modal 1 States
const [selectedClass, setSelectedClass] = useState<any>(null)
const [classJadwal, setClassJadwal] = useState<any[]>([])
const [classAbsensi, setClassAbsensi] = useState<any[]>([])
const [showClassModal, setShowClassModal] = useState(false)

// Modal 2 States (BARU)
const [selectedJadwal, setSelectedJadwal] = useState<any>(null)
const [jadwalAbsensi, setJadwalAbsensi] = useState<any[]>([])
const [showJadwalDetailModal, setShowJadwalDetailModal] = useState(false)
const [jadwalDetailLoading, setJadwalDetailLoading] = useState(false)
const [isDownloading, setIsDownloading] = useState(false)
```

#### Functions:

```typescript
// Fetch absensi per jadwal
fetchJadwalAbsensi(jadwalId: string)
  ├─ GET /api/absensi?jadwal_id={jadwalId}
  └─ Populate: jadwalAbsensi[]

// Download laporan
downloadReport(type: 'excel' | 'pdf')
  ├─ GET /api/reports/{type}?jadwal_id={jadwalId}
  ├─ Fetch file blob
  ├─ Trigger browser download
  └─ Show success/error alert
```

#### UI Components:

- **Modal 1**: Daftar mata kuliah dengan TouchableOpacity untuk setiap item
- **Modal 2**: 
  - Info cards (Dosen, Ruangan, Waktu)
  - Status sections dengan color-coding
  - Student rows with name dan status
  - Download buttons (Excel/PDF) dengan loading indicator

---

### 4️⃣ API Endpoints Summary

| Method | Endpoint | Parameters | Purpose |
|--------|----------|-----------|---------|
| GET | `/api/jadwal` | - | Fetch semua jadwal |
| GET | `/api/kelas` | - | Fetch semua kelas |
| GET | `/api/absensi` | `class_id`, `jadwal_id` | Fetch data absensi |
| POST | `/api/absensi/update` | `user_id`, `jadwal_id`, `status` | Update status absensi |
| GET | `/api/reports/excel` | `jadwal_id`, `class_id`, `date` | Download Excel |
| GET | `/api/reports/pdf` | `jadwal_id`, `class_id`, `date` | Download PDF |

---

## 🚀 Cara Menggunakan

### Backend Setup:

1. **Run migration** (jika database sudah ada):
```bash
mysql -u root -p db_absensi < migrations/001_add_status_absensi.sql
```

2. **Verify status di database:**
```sql
DESCRIBE absensi;
-- Pastikan column 'status' show: enum('hadir','terlambat','pulang','alfa','sakit','izin')
```

### Frontend Testing:

1. Buka app dan navigate ke Admin > Jadwal Perkuliahan
2. Pilih tab "Per Kelas"
3. Klik salah satu kelas
4. Modal 1 muncul dengan daftar mata kuliah
5. Klik mata kuliah apapun
6. Modal 2 muncul dengan:
   - Info dosen & ruangan ✅
   - Daftar mahasiswa grouped by status ✅
   - Tombol Excel/PDF ✅
7. Klik Excel atau PDF untuk download laporan

---

## 📦 Dependencies

**Backend:**
- `exceljs` - Untuk export Excel
- `pdfmake` - Untuk export PDF
- `mysql2/promise` - Untuk database queries

**Frontend:**
- `react-native` - Core framework
- `expo-file-system` - File operations
- `react-native` Linking - URL handling
- `lucide-react-native` - Icons

---

## ⚠️ Catatan Penting

1. **Download di mobile:** Menggunakan browser default device, bukan in-app download
2. **Authorization:** Semua endpoint memerlukan Bearer token di header
3. **Filter data:** 
   - Modal 1 menampilkan jadwal 1 minggu per kelas
   - Modal 2 menampilkan semua absensi untuk jadwal spesifik
4. **Status colors:**
   - Hadir: 🟢 #10B981 (Hijau)
   - Terlambat: 🟡 #F59E0B (Kuning)
   - Sakit: 🟣 #8B5CF6 (Ungu)
   - Izin: 🔵 #06B6D4 (Cyan)
   - Alfa: 🔴 #EF4444 (Merah)

---

## 🔗 Related Files

**Frontend:**
- `src/screens/AdminJadwalScreen.tsx` - Main screen

**Backend:**
- `controllers/absensiController.js` - Absensi logic
- `controllers/reportController.js` - Export logic
- `routes/api.js` - API routes
- `database.sql` - Schema

**Migration:**
- `migrations/001_add_status_absensi.sql` - Add status to ENUM

---

**Last Updated:** April 23, 2026
**Status:** ✅ PRODUCTION READY
