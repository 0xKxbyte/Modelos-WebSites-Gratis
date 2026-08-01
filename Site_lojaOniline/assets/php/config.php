<?php
session_start();
ob_start();

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'loja_online');
define('SITE_URL', 'http://localhost/Site_lojaOniline');
define('SITE_NAME', 'TechStore Pro');
define('SITE_DESC', 'Sua loja de tecnologia premium');
define('API_CEP_URL', 'https://viacep.com.br/ws/');

define('GOOGLE_CLIENT_ID', 'SEU_GOOGLE_CLIENT_ID_AQUI');
define('GOOGLE_CLIENT_SECRET', 'SEU_GOOGLE_CLIENT_SECRET_AQUI');
define('GOOGLE_REDIRECT_URL', SITE_URL . '/assets/php/google-callback.php');

define('MERCADO_PAGO_TOKEN', 'SEU_TOKEN_MERCADO_PAGO_AQUI');
define('MERCADO_PAGO_PUBLIC_KEY', 'SUA_PUBLIC_KEY_AQUI');

date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');

function gerarToken($tamanho = 32) {
    return bin2hex(random_bytes($tamanho));
}

function sanitizar($dado) {
    return htmlspecialchars(strip_tags(trim($dado)), ENT_QUOTES, 'UTF-8');
}

function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function formatarPreco($valor) {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}

function calcularParcelas($valor, $parcelas = 12) {
    $valorParcela = $valor / $parcelas;
    return [
        'quantidade' => $parcelas,
        'valor_parcela' => $valorParcela,
        'valor_total' => $valor
    ];
}

function tempoRelativo($data) {
    $agora = new DateTime();
    $dataObj = new DateTime($data);
    $intervalo = $agora->diff($dataObj);

    if ($intervalo->y > 0) return $intervalo->y . ' ano' . ($intervalo->y > 1 ? 's' : '') . ' atrás';
    if ($intervalo->m > 0) return $intervalo->m . ' mês' . ($intervalo->m > 1 ? 'es' : '') . ' atrás';
    if ($intervalo->d > 0) return $intervalo->d . ' dia' . ($intervalo->d > 1 ? 's' : '') . ' atrás';
    if ($intervalo->h > 0) return $intervalo->h . ' hora' . ($intervalo->h > 1 ? 's' : '') . ' atrás';
    if ($intervalo->i > 0) return $intervalo->i . ' minuto' . ($intervalo->i > 1 ? 's' : '') . ' atrás';
    return 'agora mesmo';
}
