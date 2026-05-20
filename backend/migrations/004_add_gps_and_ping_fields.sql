-- Add GPS tracking fields to absensi table
ALTER TABLE absensi 
ADD COLUMN latitude VARCHAR(100) NULL AFTER status_telat,
ADD COLUMN longitude VARCHAR(100) NULL AFTER latitude,
ADD COLUMN location_name VARCHAR(255) NULL AFTER longitude;

-- Add ping tracker to kamera table
ALTER TABLE kamera 
ADD COLUMN last_ping DATETIME NULL AFTER status;

-- Drop the redundant attendance table
DROP TABLE IF EXISTS attendance;
