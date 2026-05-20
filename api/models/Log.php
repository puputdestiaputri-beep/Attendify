<?php
/**
 * Log Model
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../config/database.php';

class Log {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    /** Get logs (with optional device filter and limit) */
    public function getAll(int $deviceId = 0, int $limit = 100): array {
        if ($deviceId > 0) {
            $stmt = $this->pdo->prepare(
                "SELECT l.*, d.name AS device_name 
                 FROM logs l JOIN devices d ON l.device_id = d.id
                 WHERE l.device_id = ?
                 ORDER BY l.created_at DESC LIMIT ?"
            );
            $stmt->execute([$deviceId, $limit]);
        } else {
            $stmt = $this->pdo->prepare(
                "SELECT l.*, d.name AS device_name 
                 FROM logs l JOIN devices d ON l.device_id = d.id
                 ORDER BY l.created_at DESC LIMIT ?"
            );
            $stmt->execute([$limit]);
        }
        return $stmt->fetchAll();
    }

    /** Insert a new log entry */
    public function insert(int $deviceId, string $action, string $triggeredBy = 'manual', ?int $relayStatus = null, ?string $ip = null, ?string $notes = null): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO logs (device_id, action, triggered_by, relay_status, ip_address, notes)
             VALUES (:device_id, :action, :triggered_by, :relay_status, :ip_address, :notes)"
        );
        $stmt->execute([
            ':device_id'    => $deviceId,
            ':action'       => $action,
            ':triggered_by' => $triggeredBy,
            ':relay_status' => $relayStatus,
            ':ip_address'   => $ip,
            ':notes'        => $notes,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    /** Get log statistics for dashboard */
    public function getStats(): array {
        $stmt = $this->pdo->query(
            "SELECT 
               COUNT(*) AS total_logs,
               SUM(CASE WHEN action = 'ON' THEN 1 ELSE 0 END) AS total_on,
               SUM(CASE WHEN action = 'OFF' THEN 1 ELSE 0 END) AS total_off,
               SUM(CASE WHEN triggered_by = 'schedule' THEN 1 ELSE 0 END) AS total_scheduled,
               SUM(CASE WHEN triggered_by = 'manual' THEN 1 ELSE 0 END) AS total_manual
             FROM logs WHERE DATE(created_at) = CURDATE()"
        );
        return $stmt->fetch() ?: [];
    }

    /** Delete old logs (keep last N days) */
    public function purgeOld(int $days = 30): bool {
        return $this->pdo->prepare(
            "DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)"
        )->execute([$days]);
    }
}
