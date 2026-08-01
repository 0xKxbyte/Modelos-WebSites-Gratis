<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$acao = $_GET['acao'] ?? '';
$db = Database::getInstancia();

switch ($acao) {
    case 'listar':
        $categoria = $_GET['categoria'] ?? null;
        $busca = $_GET['busca'] ?? null;
        $ordenar = $_GET['ordenar'] ?? 'destaque';
        $limite = min(50, max(1, (int)($_GET['limite'] ?? 12)));
        $pagina = max(1, (int)($_GET['pagina'] ?? 1));

        $sql = "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
                FROM produtos p JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.ativo = 1";
        $params = [];

        if ($categoria) {
            $sql .= " AND c.slug = ?";
            $params[] = $categoria;
        }

        if ($busca) {
            $sql .= " AND (p.nome LIKE ? OR p.descricao LIKE ?)";
            $b = "%$busca%";
            $params[] = $b;
            $params[] = $b;
        }

        switch ($ordenar) {
            case 'preco_asc': $sql .= " ORDER BY COALESCE(p.preco_promocional, p.preco) ASC"; break;
            case 'preco_desc': $sql .= " ORDER BY COALESCE(p.preco_promocional, p.preco) DESC"; break;
            case 'nome': $sql .= " ORDER BY p.nome ASC"; break;
            case 'novos': $sql .= " ORDER BY p.criado_em DESC"; break;
            default: $sql .= " ORDER BY p.destaque DESC, p.criado_em DESC"; break;
        }

        $offset = ($pagina - 1) * $limite;
        $sql .= " LIMIT $limite OFFSET $offset";

        $produtos = $db->fetchAll($sql, $params);
        foreach ($produtos as &$p) {
            $p['imagens'] = json_decode($p['imagens'], true);
            $p['especificacoes'] = json_decode($p['especificacoes'], true);
        }

        echo json_encode(['sucesso' => true, 'produtos' => $produtos]);
        break;

    case 'buscar':
        $termo = $_GET['q'] ?? '';
        if (strlen($termo) < 2) {
            echo json_encode(['sucesso' => true, 'produtos' => []]);
            exit;
        }

        $produtos = $db->fetchAll(
            "SELECT p.id, p.nome, p.slug, p.preco, p.preco_promocional, p.imagens, c.nome as categoria
             FROM produtos p JOIN categorias c ON p.categoria_id = c.id
             WHERE p.ativo = 1 AND (p.nome LIKE ? OR p.descricao LIKE ?)
             ORDER BY p.destaque DESC, p.visitas DESC LIMIT 10",
            ["%$termo%", "%$termo%"]
        );

        foreach ($produtos as &$p) {
            $p['imagens'] = json_decode($p['imagens'], true);
        }

        echo json_encode(['sucesso' => true, 'produtos' => $produtos]);
        break;

    case 'destaques':
        $produtos = $db->fetchAll(
            "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
             FROM produtos p JOIN categorias c ON p.categoria_id = c.id 
             WHERE p.destaque = 1 AND p.ativo = 1 
             ORDER BY RAND() LIMIT 8"
        );
        foreach ($produtos as &$p) {
            $p['imagens'] = json_decode($p['imagens'], true);
        }
        echo json_encode(['sucesso' => true, 'produtos' => $produtos]);
        break;

    case 'detalhe':
        $slug = $_GET['slug'] ?? '';
        $produto = $db->fetch(
            "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
             FROM produtos p JOIN categorias c ON p.categoria_id = c.id 
             WHERE p.slug = ? AND p.ativo = 1",
            [$slug]
        );
        if ($produto) {
            $produto['imagens'] = json_decode($produto['imagens'], true);
            $produto['especificacoes'] = json_decode($produto['especificacoes'], true);
            $db->update("UPDATE produtos SET visitas = visitas + 1 WHERE id = ?", [$produto['id']]);
            echo json_encode(['sucesso' => true, 'produto' => $produto]);
        } else {
            http_response_code(404);
            echo json_encode(['sucesso' => false, 'erro' => 'Produto não encontrado']);
        }
        break;

    default:
        echo json_encode(['sucesso' => false, 'erro' => 'Ação inválida']);
}
