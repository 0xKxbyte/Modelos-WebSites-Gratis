<?php
/**
 * CONFIGURACAO GERAL DO SISTEMA
 * Vitalis Farma - Sistema Farmaceutico
 */

// === CONSTANTES DO SISTEMA ===
define('SITE_NOME', 'Vitalis Farma');
define('SITE_DESCRICAO', 'Sua saude em primeiro lugar - Farmacia Vitalis Farma');
define('SITE_URL', 'http://localhost/vitalis-farma');
define('SITE_EMAIL', 'contato@vitalisfarma.com.br');
define('SITE_TELEFONE', '(11) 3000-0000');
define('SITE_ENDERECO', 'Av. das Nacoes Unidas, 1234 - Jardim Saude, Sao Paulo - SP');
define('SITE_CEP', '04578-000');
define('SITE_CNPJ', '00.000.000/0001-00');
define('SITE_CRF', 'CRF-SP 12345');
define('SITE_RESPONSAVEL_TECNICO', 'Dra. Ana Beatriz Oliveira');

// === CONFIGURACAO DE BANCO DE DADOS ===
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'vitalis_farma');
define('DB_USER', 'vitalis_user');
define('DB_PASS', 'Vitalis@2024#Farma');
define('DB_CHARSET', 'utf8mb4');

// === CONFIGURACAO DE SESSION ===
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0);
session_name('VITALIS_FARMA_SESSION');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// === CONFIGURACAO DE TIMEZONE ===
date_default_timezone_set('America/Sao_Paulo');

// === CONFIGURACAO DE ERRO (desativar em producao) ===
if (defined('DEVELOPMENT') && DEVELOPMENT === true) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// === FUNCOES GLOBAIS ===
function sanitizeInput(string $data): string {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function formatarData(string $data, string $formato = 'd/m/Y'): string {
    $timestamp = strtotime($data);
    return ($timestamp !== false) ? date($formato, $timestamp) : $data;
}

function formatarPreco(float $valor): string {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}

function gerarSlug(string $texto): string {
    $texto = preg_replace('/[^a-zA-Z0-9\s]/', '', $texto);
    $texto = strtolower(trim($texto));
    $texto = preg_replace('/\s+/', '-', $texto);
    return $texto;
}

function enviarEmail(string $para, string $assunto, string $corpo): bool {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=utf-8" . "\r\n";
    $headers .= "From: " . SITE_NOME . " <" . SITE_EMAIL . ">" . "\r\n";
    $headers .= "Reply-To: " . SITE_EMAIL . "\r\n";
    return mail($para, $assunto, $corpo, $headers);
}

function redirect(string $url): void {
    header("Location: " . $url);
    exit;
}

function isLoggedIn(): bool {
    return isset($_SESSION['cliente_id']) && !empty($_SESSION['cliente_id']);
}

function getCurrentUser(): ?array {
    if (isLoggedIn()) {
        return [
            'id' => $_SESSION['cliente_id'],
            'nome' => $_SESSION['cliente_nome'],
            'email' => $_SESSION['cliente_email']
        ];
    }
    return null;
}
