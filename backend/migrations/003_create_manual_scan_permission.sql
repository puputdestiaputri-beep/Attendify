-- MIGRATION: Create manual_scan_permission table
-- Date: Current
-- Description: Add permission system for manual face scan by students (dosen-controlled fallback)
-- =====================================================

ALTER TABLE absensi 
ADD COLUMN manual_mode TINYINT(1) DEFAULT 0 AFTER status_telat;

-- Create main permission table
CREATE TABLE IF NOT EXISTS manual_scan_permission (
    id_permission INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enabled TINYINT(1) DEFAULT 0,
    granted_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    INDEX idx_user (user_id),
    INDEX idx_enabled (enabled),
    INDEX idx_expires (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES pengguna(id_user)
);

-- Sample index for active permissions
CREATE INDEX idx_active_permissions ON manual_scan_permission (user_id, enabled, expires_at);

-- Verify creation
DESCRIBE manual_scan_permission;

-- Test query for active permissions
-- SELECT * FROM manual_scan_permission WHERE enabled = 1 AND (expires_at IS NULL OR expires_at > NOW());

