<?php
/**
 * CONEXAO COM BANCO DE DADOS MYSQL
 * Vitalis Farma - Sistema Farmaceutico
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;
    private static array $config = [
        'host'     => DB_HOST,
        'port'     => DB_PORT,
        'dbname'   => DB_NAME,
        'charset'  => DB_CHARSET,
        'user'     => DB_USER,
        'password' => DB_PASS,
    ];

    /**
     * Retorna a instancia unica de conexao PDO (Singleton)
     */
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = sprintf(
                    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                    self::$config['host'],
                    self::$config['port'],
                    self::$config['dbname'],
                    self::$config['charset']
                );

                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ];

                self::$instance = new PDO($dsn, self::$config['user'], self::$config['password'], $options);
            } catch (PDOException $e) {
                error_log("[ERRO BD] " . $e->getMessage());
                if (defined('DEVELOPMENT') && DEVELOPMENT === true) {
                    die("Erro de conexao com o banco de dados: " . $e->getMessage());
                }
                die("Erro ao conectar ao banco de dados. Tente novamente mais tarde.");
            }
        }
        return self::$instance;
    }

    /**
     * Previne clonagem da instancia
     */
    private function __clone() {}
    private function __construct() {}
}

/**
 * FUNCOES DA CAMADA DE DADOS
 */

function dbGetAll(string $sql, array $params = []): array {
    $stmt = Database::getInstance()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function dbGetOne(string $sql, array $params = []): ?array {
    $stmt = Database::getInstance()->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetch();
    return $result !== false ? $result : null;
}

function dbInsert(string $sql, array $params = []): int {
    $db = Database::getInstance();
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return (int) $db->lastInsertId();
}

function dbUpdate(string $sql, array $params = []): int {
    $stmt = Database::getInstance()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

function dbDelete(string $sql, array $params = []): int {
    $stmt = Database::getInstance()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

function dbCount(string $sql, array $params = []): int {
    $stmt = Database::getInstance()->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn();
}

/**
 * FUNCOES ESPECIFICAS DO SITE
 */

function getProdutosDestaque(int $limite = 6): array {
    return dbGetAll(
        "SELECT p.*, c.nome AS categoria_nome, c.cor AS categoria_cor
         FROM produtos p
         JOIN categorias c ON p.categoria_id = c.id
         WHERE p.destaque = 1 AND p.ativo = 1
         ORDER BY p.created_at DESC
         LIMIT ?",
        [$limite]
    );
}

function getProdutoById(int $id): ?array {
    return dbGetOne(
        "SELECT p.*, c.nome AS categoria_nome, c.cor AS categoria_cor
         FROM produtos p
         JOIN categorias c ON p.categoria_id = c.id
         WHERE p.id = ? AND p.ativo = 1",
        [$id]
    );
}

function getProdutosByCategoria(int $categoriaId): array {
    return dbGetAll(
        "SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON p.categoria_id = c.id
         WHERE p.categoria_id = ? AND p.ativo = 1
         ORDER BY p.nome ASC",
        [$categoriaId]
    );
}

function buscarProdutos(string $termo): array {
    $termoLike = '%' . $termo . '%';
    return dbGetAll(
        "SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON p.categoria_id = c.id
         WHERE p.ativo = 1
           AND (p.nome LIKE ? OR p.principio_ativo LIKE ? OR p.descricao LIKE ?)
         ORDER BY p.nome ASC
         LIMIT 20",
        [$termoLike, $termoLike, $termoLike]
    );
}

function getCategorias(): array {
    return dbGetAll(
        "SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome ASC"
    );
}

function getServicos(): array {
    return dbGetAll(
        "SELECT * FROM servicos WHERE ativo = 1 ORDER BY nome ASC"
    );
}

function getFarmaceuticos(): array {
    return dbGetAll(
        "SELECT * FROM farmaceuticos WHERE ativo = 1 ORDER BY nome ASC"
    );
}

function getBannersAtivos(): array {
    return dbGetAll(
        "SELECT * FROM banners WHERE ativo = 1 ORDER BY ordem ASC"
    );
}

function salvarMensagem(string $nome, string $email, string $telefone, string $assunto, string $mensagem): int {
    return dbInsert(
        "INSERT INTO mensagens (nome, email, telefone, assunto, mensagem)
         VALUES (?, ?, ?, ?, ?)",
        [$nome, $email, $telefone, $assunto, $mensagem]
    );
}

function criarPedido(array $dados): int {
    $db = Database::getInstance();
    try {
        $db->beginTransaction();

        $pedidoId = dbInsert(
            "INSERT INTO pedidos (cliente_id, nome_cliente, email_cliente, telefone_cliente, endereco_entrega, forma_pagamento, total, observacoes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $dados['cliente_id'] ?? null,
                $dados['nome_cliente'],
                $dados['email_cliente'],
                $dados['telefone_cliente'] ?? '',
                $dados['endereco_entrega'],
                $dados['forma_pagamento'],
                $dados['total'],
                $dados['observacoes'] ?? ''
            ]
        );

        foreach ($dados['itens'] as $item) {
            dbInsert(
                "INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?)",
                [
                    $pedidoId,
                    $item['produto_id'] ?? null,
                    $item['nome_produto'],
                    $item['quantidade'],
                    $item['preco_unitario'],
                    $item['quantidade'] * $item['preco_unitario']
                ]
            );

            if (isset($item['produto_id'])) {
                dbUpdate(
                    "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
                    [$item['quantidade'], $item['produto_id'], $item['quantidade']]
                );
            }
        }

        $db->commit();
        return $pedidoId;
    } catch (Exception $e) {
        $db->rollBack();
        error_log("[ERRO PEDIDO] " . $e->getMessage());
        throw $e;
    }
}

function cadastrarCliente(array $dados): int {
    $senhaHash = password_hash($dados['senha'], PASSWORD_BCRYPT, ['cost' => 12]);
    return dbInsert(
        "INSERT INTO clientes (nome, email, telefone, cpf, data_nascimento, endereco, cidade, estado, cep, senha_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            $dados['nome'],
            $dados['email'],
            $dados['telefone'] ?? '',
            $dados['cpf'] ?? '',
            $dados['data_nascimento'] ?? null,
            $dados['endereco'] ?? '',
            $dados['cidade'] ?? '',
            $dados['estado'] ?? '',
            $dados['cep'] ?? '',
            $senhaHash
        ]
    );
}

function autenticarCliente(string $email, string $senha): ?array {
    $cliente = dbGetOne(
        "SELECT * FROM clientes WHERE email = ? AND ativo = 1",
        [$email]
    );

    if ($cliente && password_verify($senha, $cliente['senha_hash'])) {
        unset($cliente['senha_hash']);
        return $cliente;
    }
    return null;
}

function getEstatisticas(): array {
    return [
        'total_produtos'    => dbCount("SELECT COUNT(*) FROM produtos WHERE ativo = 1"),
        'total_servicos'    => dbCount("SELECT COUNT(*) FROM servicos WHERE ativo = 1"),
        'total_clientes'    => dbCount("SELECT COUNT(*) FROM clientes WHERE ativo = 1"),
        'total_pedidos'     => dbCount("SELECT COUNT(*) FROM pedidos"),
        'total_mensagens'   => dbCount("SELECT COUNT(*) FROM mensagens"),
        'farmaceuticos'     => dbCount("SELECT COUNT(*) FROM farmaceuticos WHERE ativo = 1"),
    ];
}

function registrarLog(string $acao, string $tabela, ?int $registroId = null, ?string $detalhes = null): void {
    $usuarioId = $_SESSION['cliente_id'] ?? $_SESSION['admin_id'] ?? null;
    dbInsert(
        "INSERT INTO logs (usuario_id, acao, tabela, registro_id, detalhes, ip)
         VALUES (?, ?, ?, ?, ?, ?)",
        [$usuarioId, $acao, $tabela, $registroId, $detalhes, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']
    );
}
