<?php
/**
 * API DE CONTATO - Vitalis Farma
 * Processa formulario de contato e retorna JSON
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo nao permitido']);
    exit;
}

require_once __DIR__ . '/conexao.php';

try {
    $nome     = sanitizeInput($_POST['nome'] ?? '');
    $email    = sanitizeInput($_POST['email'] ?? '');
    $telefone = sanitizeInput($_POST['telefone'] ?? '');
    $assunto  = sanitizeInput($_POST['assunto'] ?? '');
    $mensagem = sanitizeInput($_POST['mensagem'] ?? '');

    // Validacoes
    $erros = [];

    if (empty($nome) || strlen($nome) < 3) {
        $erros[] = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erros[] = 'Email invalido';
    }

    if (empty($assunto)) {
        $erros[] = 'Assunto e obrigatorio';
    }

    if (empty($mensagem) || strlen($mensagem) < 10) {
        $erros[] = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    if (!empty($telefone) && !preg_match('/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/', $telefone)) {
        $erros[] = 'Telefone invalido';
    }

    if (!empty($erros)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => $erros]);
        exit;
    }

    // Salva no banco
    $id = salvarMensagem($nome, $email, $telefone, $assunto, $mensagem);

    // Envia email de confirmacao
    $corpoEmail = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background: linear-gradient(135deg, #FF6B6B, #4ECDC4); padding: 30px; text-align: center;'>
            <h1 style='color: #fff; margin: 0;'>Vitalis Farma</h1>
            <p style='color: #fff; margin: 10px 0 0;'>Recebemos sua mensagem</p>
        </div>
        <div style='padding: 30px; background: #f9f9f9;'>
            <p>Ola <strong>{$nome}</strong>,</p>
            <p>Agradecemos pelo seu contato! Recebemos sua mensagem sobre <strong>{$assunto}</strong> e responderemos em ate 24 horas uteis.</p>
            <div style='background: #fff; border-left: 4px solid #4ECDC4; padding: 15px; margin: 20px 0;'>
                <p style='margin: 0;'><strong>Mensagem enviada:</strong></p>
                <p style='margin: 10px 0 0; color: #666;'>{$mensagem}</p>
            </div>
            <p><strong>Protocolo:</strong> #{$id}</p>
            <p>Atenciosamente,<br>Equipe Vitalis Farma</p>
        </div>
    </div>";

    enviarEmail($email, 'Recebemos sua mensagem - Vitalis Farma', $corpoEmail);

    echo json_encode([
        'success' => true,
        'message' => 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        'protocolo' => "#{$id}"
    ]);

} catch (Exception $e) {
    error_log("[ERRO CONTATO] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar sua mensagem. Tente novamente mais tarde.'
    ]);
}
