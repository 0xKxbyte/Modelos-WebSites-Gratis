<?php
/**
 * Configuração do Banco de Dados
 * Escritório de Advocacia - Dr. Ricardo Almeida
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'db_advocacia');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

define('SITE_NAME', 'Dr. Ricardo Almeida | Advocacia');
define('SITE_URL', 'http://localhost/Site_Advogado');
define('ADMIN_EMAIL', 'contato@ricardoalmeida.adv.br');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro de conexão com o banco de dados.',
        'debug' => DB_HOST === 'localhost' ? $e->getMessage() : null
    ]);
    exit;
}

function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    return preg_match('/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/', trim($phone));
}

function log_sistema($pdo, $acao, $descricao = null) {
    try {
        $stmt = $pdo->prepare("INSERT INTO logs_sistema (acao, descricao, ip_address, user_agent) VALUES (:acao, :descricao, :ip, :ua)");
        $stmt->execute([
            ':acao' => $acao,
            ':descricao' => $descricao,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (PDOException $e) {
        // Silently fail for logs
    }
}
?>
