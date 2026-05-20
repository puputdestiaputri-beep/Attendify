-- Migration 005: Create Face System Tables
-- Goal: Dedicated tables for admin-controlled face registration

CREATE TABLE IF NOT EXISTS face_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    embedding_data LONGTEXT, -- Store JSON string of Float32Array
    face_image VARCHAR(255),
    verification_status ENUM('NOT_REGISTERED', 'PENDING', 'VERIFIED', 'FAILED') DEFAULT 'NOT_REGISTERED',
    confidence_threshold FLOAT DEFAULT 0.6,
    last_trained TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS face_training_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    training_result TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES pengguna(id_user) ON DELETE CASCADE
);

-- Optional: Add a column to pengguna to easily check if they have a verified face
ALTER TABLE pengguna ADD COLUMN is_face_verified TINYINT(1) DEFAULT 0;
