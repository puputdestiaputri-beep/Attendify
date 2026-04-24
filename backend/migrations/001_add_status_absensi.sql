-- =========================
-- MIGRATION: Add 'sakit' and 'izin' status to absensi table
-- Date: April 2026
-- Description: Update absensi status ENUM to support sakit and izin status
-- =========================

-- Modify the ENUM column to add new status values
ALTER TABLE absensi 
MODIFY COLUMN status ENUM('hadir','terlambat','pulang','alfa','sakit','izin') DEFAULT 'hadir';

-- Verify the change
DESCRIBE absensi;
