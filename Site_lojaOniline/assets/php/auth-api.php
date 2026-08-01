<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php';

$auth = new Auth();
$acao = $_POST['acao'] ?? '';

switch ($acao) {
    case 'registrar':
        $nome = sanitizar($_POST['nome'] ?? '');
        $email = sanitizar($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';

        if (empty($nome) || empty($email) || empty($senha)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Preencha todos os campos']);
            exit;
        }

        if (strlen($senha) < 6) {
            echo json_encode(['sucesso' => false, 'erro' => 'Senha deve ter no mínimo 6 caracteres']);
            exit;
        }

        $resultado = $auth->registrar($nome, $email, $senha);
        echo json_encode($resultado);
        break;

    case 'login':
        $email = sanitizar($_POST['email'] ?? '');
        $senha = $_POST['senha'] ?? '';

        if (empty($email) || empty($senha)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Preencha email e senha']);
            exit;
        }

        $resultado = $auth->login($email, $senha);
        echo json_encode($resultado);
        break;

    case 'login_google':
        $googleId = sanitizar($_POST['google_id'] ?? '');
        $nome = sanitizar($_POST['nome'] ?? '');
        $email = sanitizar($_POST['email'] ?? '');
        $avatar = sanitizar($_POST['avatar'] ?? '');

        $resultado = $auth->loginGoogle($googleId, $nome, $email, $avatar);
        echo json_encode($resultado);
        break;

    case 'logout':
        $auth->logout();
        echo json_encode(['sucesso' => true]);
        break;

    case 'verificar':
        $usuario = $auth->getUsuarioLogado();
        if ($usuario) {
            echo json_encode(['logado' => true, 'usuario' => $usuario]);
        } else {
            echo json_encode(['logado' => false]);
        }
        break;

    default:
        echo json_encode(['sucesso' => false, 'erro' => 'Ação inválida']);
}
