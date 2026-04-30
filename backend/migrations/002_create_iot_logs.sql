-- IoT Logs Table Migration
-- For tracking and monitoring ESP32 device activities

CREATE TABLE IF NOT EXISTS iot_logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    status ENUM('matched', 'unknown', 'duplicate', 'no_schedule', 'rate_limited', 'error') NOT NULL,
    user_id INT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES pengguna(id_user),
    INDEX idx_device_id (device_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);

-- Sample query to check recent IoT activity:
-- SELECT * FROM iot_logs ORDER BY timestamp DESC LIMIT 20;

-- Count scans per device:
-- SELECT device_id, COUNT(*) as scan_count FROM iot_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) GROUP BY device_id;
