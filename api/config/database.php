<?php
/**
 * Database Configuration & PDO Connection
 * Stop Kontak Otomatis
 */

class Database {
    private string $host     = 'localhost';
    private string $db_name  = 'db_absensi';
    private string $username = 'root';
    private string $password = '';
    private string $charset  = 'utf8mb4';
    
    private static ?PDO $instance = null;

    /**
     * Singleton PDO connection
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $db = new self();
            $dsn = "mysql:host={$db->host};dbname={$db->db_name};charset={$db->charset}";
            
            try {
                self::$instance = new PDO($dsn, $db->username, $db->password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
