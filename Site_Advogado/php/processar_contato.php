<?php
/**
 * Processar Formulário de Contato
 * Escritório de Advocacia - Dr. Ricardo Almeida
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$nome     = sanitize($_POST['nome'] ?? '');
$email    = sanitize($_POST['email'] ?? '');
$telefone = sanitize($_POST['telefone'] ?? '');
$assunto  = sanitize($_POST['assunto'] ?? '');
$mensagem = sanitize($_POST['mensagem'] ?? '');

$erros = [];

if (empty($nome) || strlen($nome) < 3) {
    $erros[] = 'O nome deve conter pelo menos 3 caracteres.';
}
if (strlen($nome) > 120) {
    $erros[] = 'O nome é muito longo.';
}

if (!validate_email($email)) {
    $erros[] = 'Informe um endereço de email válido.';
}

if (!empty($telefone) && !validate_phone($telefone)) {
    $erros[] = 'Informe um telefone válido (formato: (11) 99999-8888).';
}

if (empty($mensagem) || strlen($mensagem) < 10) {
    $erros[] = 'A mensagem deve conter pelo menos 10 caracteres.';
}
if (strlen($mensagem) > 5000) {
    $erros[] = 'A mensagem é muito longa (máximo 5000 caracteres).';
}

// Honeypot anti-spam
if (!empty($_POST['website'])) {
    http_response_code(200);
    echo json_encode(['sucesso' => 'Mensagem enviada com sucesso!']);
    exit;
}

// Time check anti-spam (mínimo 3 segundos)
if (!empty($_POST['timestamp']) && (time() - intval($_POST['timestamp'])) < 3) {
    http_response_code(400);
    echo json_encode(['erro' => 'Formulário enviado muito rápido. Aguarde alguns segundos.']);
    exit;
}

if (!empty($erros)) {
    http_response_code(400);
    echo json_encode(['erro' => implode(' ', $erros)]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO contatos (nome, email, telefone, assunto, mensagem, origem, ip_address, user_agent) 
        VALUES (:nome, :email, :telefone, :assunto, :mensagem, :origem, :ip, :ua)
    ");

    $stmt->execute([
        ':nome'     => $nome,
        ':email'    => $email,
        ':telefone' => $telefone,
        ':assunto'  => $assunto,
        ':mensagem' => $mensagem,
        ':origem'   => 'site',
        ':ip'       => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        ':ua'       => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);

    log_sistema($pdo, 'contato_enviado', "Contato de $nome ($email)");

    // Email de notificação (opcional)
    $para = ADMIN_EMAIL;
    $assunto_email = "Novo contato de $nome - " . SITE_NAME;
    $corpo = "Nome: $nome\nEmail: $email\nTelefone: $telefone\nAssunto: $assunto\nMensagem: $mensagem";
    $headers = "From: $email\r\nReply-To: $email";
    @mail($para, $assunto_email, $corpo, $headers);

    echo json_encode([
        'sucesso' => 'Mensagem enviada com sucesso! Em breve entraremos em contato.',
        'id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    log_sistema($pdo, 'erro_contato', $e->getMessage());
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao processar sua mensagem. Tente novamente mais tarde.']);
}
?>
