<?php
/**
 * Device Model
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../config/database.php';

class Device {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    /** Get all devices */
    public function getAll(): array {
        $stmt = $this->pdo->query(
            "SELECT *, 
             CASE WHEN last_seen >= DATE_SUB(NOW(), INTERVAL 30 SECOND) THEN 1 ELSE 0 END AS is_online
             FROM devices ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    /** Get single device by ID */
    public function getById(int $id) {
        $stmt = $this->pdo->prepare(
            "SELECT *, 
             CASE WHEN last_seen >= DATE_SUB(NOW(), INTERVAL 30 SECOND) THEN 1 ELSE 0 END AS is_online
             FROM devices WHERE id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    /** Get device by device_key (for ESP32 auth) */
    public function getByKey(string $key) {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM devices WHERE device_key = ?"
        );
        $stmt->execute([$key]);
        return $stmt->fetch();
    }

    /** Create new device */
    public function create(array $data): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO devices (name, device_key, description, relay_count, location)
             VALUES (:name, :device_key, :description, :relay_count, :location)"
        );
        $stmt->execute([
            ':name'         => $data['name'],
            ':device_key'   => $data['device_key'] ?? $this->generateKey(),
            ':description'  => $data['description'] ?? null,
            ':relay_count'  => $data['relay_count'] ?? 1,
            ':location'     => $data['location'] ?? null,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    /** Update device info */
    public function update(int $id, array $data): bool {
        $fields = [];
        $params = [':id' => $id];

        $allowed = ['name', 'description', 'location', 'relay_count'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $sql = "UPDATE devices SET " . implode(', ', $fields) . " WHERE id = :id";
        return $this->pdo->prepare($sql)->execute($params);
    }

    /** Toggle relay status */
    public function toggleRelay(int $id) {
        $device = $this->getById($id);
        if (!$device) return false;

        $newStatus = $device['relay_status'] ? 0 : 1;
        $stmt = $this->pdo->prepare(
            "UPDATE devices SET relay_status = ? WHERE id = ?"
        );
        $stmt->execute([$newStatus, $id]);

        return ['id' => $id, 'relay_status' => $newStatus];
    }

    /** Set relay status explicitly */
    public function setRelay(int $id, int $status): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE devices SET relay_status = ? WHERE id = ?"
        );
        return $stmt->execute([$status, $id]);
    }

    /** Update heartbeat from ESP32 */
    public function updateHeartbeat(int $id, string $ip): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE devices SET last_seen = NOW(), ip_address = ?, is_online = 1 WHERE id = ?"
        );
        return $stmt->execute([$ip, $id]);
    }

    /** Mark all devices offline (cron job use) */
    public function markOfflineAll(): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE devices SET is_online = 0 
             WHERE last_seen < DATE_SUB(NOW(), INTERVAL 30 SECOND) OR last_seen IS NULL"
        );
        return $stmt->execute();
    }

    /** Delete device */
    public function delete(int $id): bool {
        return $this->pdo->prepare("DELETE FROM devices WHERE id = ?")->execute([$id]);
    }

    /** Generate unique device key */
    private function generateKey(): string {
        return 'ESP32-' . strtoupper(bin2hex(random_bytes(4))) . '-' . rand(100, 999);
    }
}
