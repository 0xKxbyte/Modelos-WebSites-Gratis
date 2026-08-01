<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo nao permitido.']);
    exit;
}

// Sanitizar e validar campos
$nome = isset($_POST['nome']) ? sanitize($_POST['nome']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$telefone = isset($_POST['telefone']) ? sanitize($_POST['telefone']) : '';
$interesse = isset($_POST['interesse']) ? sanitize($_POST['interesse']) : '';
$mensagem = isset($_POST['mensagem']) ? sanitize($_POST['mensagem']) : '';

// Validacoes
$errors = [];

if (empty($nome) || strlen($nome) < 3) {
    $errors[] = 'Nome deve ter pelo menos 3 caracteres.';
}

if (empty($email) || !validateEmail($email)) {
    $errors[] = 'E-mail invalido.';
}

if (empty($mensagem) || strlen($mensagem) < 10) {
    $errors[] = 'Mensagem deve ter pelo menos 10 caracteres.';
}

if (!empty($telefone) && !validatePhone($telefone)) {
    $errors[] = 'Telefone invalido. Use o formato (XX) XXXXX-XXXX.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Tentar salvar no banco de dados
$conn = getConnection();
$savedToDB = false;

if ($conn) {
    $stmt = $conn->prepare(
        "INSERT INTO contatos (nome, email, telefone, interesse, mensagem, created_at) VALUES (?, ?, ?, ?, ?, NOW())"
    );
    
    if ($stmt) {
        $stmt->bind_param('sssss', $nome, $email, $telefone, $interesse, $mensagem);
        
        if ($stmt->execute()) {
            $savedToDB = true;
            logActivity('Contato salvo no BD', "Nome: $nome, Email: $email");
        } else {
            logActivity('Erro ao salvar contato no BD', $stmt->error);
        }
        
        $stmt->close();
    }
    $conn->close();
}

// Enviar email de notificacao (opcional)
$emailSent = false;
$to = 'contato@irongym.com.br';
$subject = "Novo contato de $nome - Iron Gym";
$emailBody = "
<html>
<head><title>Novo Contato - Iron Gym</title></head>
<body style='font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;'>
    <div style='max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:32px;'>
        <h1 style='color:#0066ff;font-family:Oswald,sans-serif;text-transform:uppercase;margin-bottom:24px;'>Novo Contato</h1>
        <table style='width:100%;border-collapse:collapse;'>
            <tr><td style='padding:12px 0;color:#9ca3af;border-bottom:1px solid #2a2a2a;'>Nome</td><td style='padding:12px 0;color:#fff;border-bottom:1px solid #2a2a2a;'>$nome</td></tr>
            <tr><td style='padding:12px 0;color:#9ca3af;border-bottom:1px solid #2a2a2a;'>E-mail</td><td style='padding:12px 0;color:#fff;border-bottom:1px solid #2a2a2a;'>$email</td></tr>
            <tr><td style='padding:12px 0;color:#9ca3af;border-bottom:1px solid #2a2a2a;'>Telefone</td><td style='padding:12px 0;color:#fff;border-bottom:1px solid #2a2a2a;'>" . (!empty($telefone) ? $telefone : 'Nao informado') . "</td></tr>
            <tr><td style='padding:12px 0;color:#9ca3af;border-bottom:1px solid #2a2a2a;'>Interesse</td><td style='padding:12px 0;color:#fff;border-bottom:1px solid #2a2a2a;'>" . (!empty($interesse) ? $interesse : 'Nao informado') . "</td></tr>
            <tr><td style='padding:12px 0;color:#9ca3af;vertical-align:top;'>Mensagem</td><td style='padding:12px 0;color:#fff;'>$mensagem</td></tr>
        </table>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: contato@irongym.com.br\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

try {
    if (mail($to, $subject, $emailBody, $headers)) {
        $emailSent = true;
    }
} catch (Exception $e) {
    logActivity('Erro ao enviar email', $e->getMessage());
}

// Resposta final
$message = 'Mensagem enviada com sucesso!';

if ($savedToDB && $emailSent) {
    $message = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
} elseif ($savedToDB) {
    $message = 'Mensagem registrada com sucesso! Entraremos em contato em breve.';
} elseif ($emailSent) {
    $message = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
} else {
    $message = 'Mensagem recebida! Entraremos em contato em breve.';
}

echo json_encode([
    'success' => true,
    'message' => $message
]);
?>
