<?php
// Configuracao do banco de dados MySQL
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'iron_gym');

// Conexao com o banco de dados
function getConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            throw new Exception('Falha na conexao: ' . $conn->connect_error);
        }
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        error_log('Erro de conexao: ' . $e->getMessage());
        return null;
    }
}

// Funcao para sanitizar dados
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Funcao para validar email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Funcao para validar telefone
function validatePhone($phone) {
    return preg_match('/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/', $phone);
}

// Funcao para registrar log
function logActivity($action, $details = '') {
    $logFile = __DIR__ . '/../logs/activity.log';
    $dir = dirname($logFile);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $logEntry = "[$timestamp] IP: $ip | Acao: $action | Detalhes: $details" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}
?>
