-- Migration 006: Realtime Reporting, Attendance Communication & Approval System

-- 1. Create audit_logs table to track all approval/status changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'reports', 'absensi', 'daily_attendance'
    entity_id INT NOT NULL,
    action_by_user_id INT, -- user who performed the action
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (action_by_user_id) REFERENCES pengguna(id_user) ON DELETE SET NULL
);

-- 2. Alter reports table
ALTER TABLE reports
ADD COLUMN sender_user_id INT,
ADD COLUMN sender_role VARCHAR(50),
ADD COLUMN title VARCHAR(255),
ADD COLUMN description TEXT,
ADD COLUMN category VARCHAR(50),
ADD COLUMN image LONGTEXT,
ADD COLUMN location VARCHAR(100),
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN approved_by INT,
ADD COLUMN approved_at DATETIME,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD FOREIGN KEY (sender_user_id) REFERENCES pengguna(id_user) ON DELETE SET NULL,
ADD FOREIGN KEY (approved_by) REFERENCES pengguna(id_user) ON DELETE SET NULL;

-- Note: In older structure, `reports` had `user_id`, `role`, `message`, `status`. 
-- We will migrate existing data if needed or just use the new columns going forward.
-- To avoid issues with old queries during transition, we keep old columns and populate new ones or vice versa in code.

-- 3. Create daily_attendance_reports table
CREATE TABLE IF NOT EXISTS daily_attendance_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dosen_id INT NOT NULL,
    class_id INT,
    report_date DATE NOT NULL,
    total_present INT DEFAULT 0,
    total_late INT DEFAULT 0,
    total_absent INT DEFAULT 0,
    attendance_percentage FLOAT DEFAULT 0.0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dosen_id) REFERENCES pengguna(id_user) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES kelas(id_kelas) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES pengguna(id_user) ON DELETE SET NULL
);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_user_id INT NOT NULL,
    sender_user_id INT,
    type VARCHAR(50) NOT NULL, -- NEW_REPORT, ATTENDANCE_SUCCESS, DAILY_REPORT, REPORT_STATUS_UPDATE, ATTENDANCE_VALIDATION
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiver_user_id) REFERENCES pengguna(id_user) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES pengguna(id_user) ON DELETE SET NULL
);

-- 5. Alter absensi table for approval tracking
ALTER TABLE absensi
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN approved_by INT, -- Could be Admin ID, Dosen ID, or NULL if AI (maybe we set it to a system user ID or leave NULL and use notes)
ADD COLUMN approved_at DATETIME,
ADD COLUMN rejection_reason TEXT,
ADD FOREIGN KEY (approved_by) REFERENCES pengguna(id_user) ON DELETE SET NULL;
