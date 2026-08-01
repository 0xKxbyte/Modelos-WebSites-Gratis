<?php
require_once __DIR__ . '/db.php';

class Auth {
    private $db;
    private $sessaoToken;

    public function __construct() {
        $this->db = Database::getInstancia();
        $this->sessaoToken = $this->getSessionToken();
        $this->limparSessoesExpiradas();
    }

    private function getSessionToken() {
        if (!isset($_COOKIE['sessao_token'])) {
            $token = bin2hex(random_bytes(32));
            setcookie('sessao_token', $token, time() + 86400 * 7, '/', '', false, true);
            return $token;
        }
        return $_COOKIE['sessao_token'];
    }

    private function limparSessoesExpiradas() {
        $this->db->delete("DELETE FROM sessoes WHERE expira_em < NOW()");
    }

    public function registrar($nome, $email, $senha) {
        if (!validarEmail($email)) {
            return ['sucesso' => false, 'erro' => 'Email inválido'];
        }

        $existe = $this->db->fetch("SELECT id FROM usuarios WHERE email = ?", [$email]);
        if ($existe) {
            return ['sucesso' => false, 'erro' => 'Email já cadastrado'];
        }

        $senhaHash = password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]);
        $token = gerarToken();

        $id = $this->db->insert(
            "INSERT INTO usuarios (nome, email, senha, token_acesso, token_expiracao) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [$nome, $email, $senhaHash, $token]
        );

        $this->criarSessao($id);
        return ['sucesso' => true, 'usuario_id' => $id, 'token' => $token];
    }

    public function login($email, $senha) {
        $usuario = $this->db->fetch("SELECT * FROM usuarios WHERE email = ?", [$email]);

        if (!$usuario || !password_verify($senha, $usuario['senha'])) {
            $this->logSeguranca(null, 'login_falho', "Tentativa de login para: $email");
            return ['sucesso' => false, 'erro' => 'Email ou senha inválidos'];
        }

        $token = gerarToken();
        $this->db->update(
            "UPDATE usuarios SET token_acesso = ?, token_expiracao = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?",
            [$token, $usuario['id']]
        );

        $this->criarSessao($usuario['id']);
        $this->logSeguranca($usuario['id'], 'login_sucesso', 'Login realizado com sucesso');

        return [
            'sucesso' => true,
            'usuario' => [
                'id' => $usuario['id'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'avatar' => $usuario['avatar']
            ],
            'token' => $token
        ];
    }

    public function loginGoogle($googleId, $nome, $email, $avatar) {
        $usuario = $this->db->fetch("SELECT * FROM usuarios WHERE google_id = ? OR email = ?", [$googleId, $email]);

        if ($usuario) {
            if (!$usuario['google_id']) {
                $this->db->update("UPDATE usuarios SET google_id = ?, avatar = ? WHERE id = ?", [$googleId, $avatar, $usuario['id']]);
            }
            $usuarioId = $usuario['id'];
        } else {
            $senhaHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
            $token = gerarToken();
            $usuarioId = $this->db->insert(
                "INSERT INTO usuarios (nome, email, senha, google_id, avatar, token_acesso, token_expiracao) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
                [$nome, $email, $senhaHash, $googleId, $avatar, $token]
            );
        }

        $this->criarSessao($usuarioId);
        return ['sucesso' => true, 'usuario_id' => $usuarioId];
    }

    public function logout() {
        if ($this->estaLogado()) {
            $this->db->delete("DELETE FROM sessoes WHERE token_sessao = ?", [$this->sessaoToken]);
        }
        setcookie('sessao_token', '', time() - 3600, '/');
        session_destroy();
    }

    public function estaLogado() {
        $sessao = $this->db->fetch(
            "SELECT s.*, u.id as uid, u.nome, u.email, u.avatar FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token_sessao = ? AND s.expira_em > NOW()",
            [$this->sessaoToken]
        );
        return $sessao ? $sessao : false;
    }

    private function criarSessao($usuarioId) {
        $expira = date('Y-m-d H:i:s', time() + 86400 * 7);
        $this->db->delete("DELETE FROM sessoes WHERE token_sessao = ?", [$this->sessaoToken]);
        $this->db->insert(
            "INSERT INTO sessoes (usuario_id, token_sessao, dados_sessao, ip_address, user_agent, expira_em) VALUES (?, ?, ?, ?, ?, ?)",
            [
                $usuarioId,
                $this->sessaoToken,
                json_encode(['user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '']),
                $_SERVER['REMOTE_ADDR'] ?? '',
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                $expira
            ]
        );
    }

    public function getUsuarioLogado() {
        $sessao = $this->estaLogado();
        if (!$sessao) return null;
        return [
            'id' => $sessao['uid'],
            'nome' => $sessao['nome'],
            'email' => $sessao['email'],
            'avatar' => $sessao['avatar']
        ];
    }

    private function logSeguranca($usuarioId, $tipo, $descricao) {
        $this->db->insert(
            "INSERT INTO logs_seguranca (usuario_id, tipo, ip_address, descricao) VALUES (?, ?, ?, ?)",
            [$usuarioId, $tipo, $_SERVER['REMOTE_ADDR'] ?? '', $descricao]
        );
    }
}
