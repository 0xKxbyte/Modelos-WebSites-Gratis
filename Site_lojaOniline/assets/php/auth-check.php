<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php';

$auth = new Auth();
$usuario = $auth->getUsuarioLogado();

if ($usuario) {
    echo json_encode(['logado' => true, 'usuario' => $usuario]);
} else {
    echo json_encode(['logado' => false]);
}
