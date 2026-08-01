<?php
require_once __DIR__ . '/config.php';

class Database {
    private static $instancia = null;
    private $conexao;

    private function __construct() {
        try {
            $this->conexao = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            die('Erro de conexão: ' . $e->getMessage());
        }
    }

    public static function getInstancia() {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia;
    }

    public function getConexao() {
        return $this->conexao;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->conexao->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Erro SQL: " . $e->getMessage() . " | SQL: " . $sql);
            throw $e;
        }
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetch($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    public function insert($sql, $params = []) {
        $this->query($sql, $params);
        return $this->conexao->lastInsertId();
    }

    public function update($sql, $params = []) {
        return $this->query($sql, $params)->rowCount();
    }

    public function delete($sql, $params = []) {
        return $this->query($sql, $params)->rowCount();
    }
}
