<?php
/**
 * Schedule Model
 * Stop Kontak Otomatis
 */

require_once __DIR__ . '/../config/database.php';

class Schedule {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    /** Get all schedules (optionally filter by device_id) */
    public function getAll(int $deviceId = 0): array {
        if ($deviceId > 0) {
            $stmt = $this->pdo->prepare(
                "SELECT s.*, d.name AS device_name 
                 FROM schedules s JOIN devices d ON s.device_id = d.id
                 WHERE s.device_id = ? ORDER BY s.time_on ASC"
            );
            $stmt->execute([$deviceId]);
        } else {
            $stmt = $this->pdo->query(
                "SELECT s.*, d.name AS device_name 
                 FROM schedules s JOIN devices d ON s.device_id = d.id
                 ORDER BY d.name, s.time_on ASC"
            );
        }
        return $stmt->fetchAll();
    }

    /** Get single schedule */
    public function getById(int $id): array|false {
        $stmt = $this->pdo->prepare(
            "SELECT s.*, d.name AS device_name 
             FROM schedules s JOIN devices d ON s.device_id = d.id
             WHERE s.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    /** Get active schedules for a device (for ESP32) */
    public function getActiveByDeviceKey(string $deviceKey): array {
        $stmt = $this->pdo->prepare(
            "SELECT s.* FROM schedules s 
             JOIN devices d ON s.device_id = d.id
             WHERE d.device_key = ? AND s.is_active = 1"
        );
        $stmt->execute([$deviceKey]);
        return $stmt->fetchAll();
    }

    /** Create new schedule */
    public function create(array $data): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO schedules (device_id, name, time_on, time_off, days, is_active)
             VALUES (:device_id, :name, :time_on, :time_off, :days, :is_active)"
        );
        $stmt->execute([
            ':device_id' => $data['device_id'],
            ':name'      => $data['name'],
            ':time_on'   => $data['time_on'],
            ':time_off'  => $data['time_off'],
            ':days'      => is_array($data['days']) ? implode(',', $data['days']) : $data['days'],
            ':is_active' => $data['is_active'] ?? 1,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    /** Update schedule */
    public function update(int $id, array $data): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE schedules SET 
             name = :name, time_on = :time_on, time_off = :time_off, 
             days = :days, is_active = :is_active
             WHERE id = :id"
        );
        return $stmt->execute([
            ':name'      => $data['name'],
            ':time_on'   => $data['time_on'],
            ':time_off'  => $data['time_off'],
            ':days'      => is_array($data['days']) ? implode(',', $data['days']) : $data['days'],
            ':is_active' => $data['is_active'] ?? 1,
            ':id'        => $id,
        ]);
    }

    /** Toggle active status */
    public function toggleActive(int $id): bool {
        $stmt = $this->pdo->prepare(
            "UPDATE schedules SET is_active = NOT is_active WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }

    /** Delete schedule */
    public function delete(int $id): bool {
        return $this->pdo->prepare("DELETE FROM schedules WHERE id = ?")->execute([$id]);
    }
}
