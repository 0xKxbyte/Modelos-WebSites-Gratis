<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php';

$auth = new Auth();
$usuario = $auth->getUsuarioLogado();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['sucesso' => false, 'erro' => 'Faça login para finalizar a compra']);
    exit;
}

$db = Database::getInstancia();
$acao = $_POST['acao'] ?? '';

switch ($acao) {
    case 'adicionar_carrinho':
        $produtoId = (int)$_POST['produto_id'];
        $quantidade = max(1, (int)($_POST['quantidade'] ?? 1));

        $produto = $db->fetch("SELECT id, nome, preco, preco_promocional, estoque FROM produtos WHERE id = ? AND ativo = 1", [$produtoId]);
        if (!$produto) {
            echo json_encode(['sucesso' => false, 'erro' => 'Produto não encontrado']);
            exit;
        }

        if ($produto['estoque'] < $quantidade) {
            echo json_encode(['sucesso' => false, 'erro' => 'Estoque insuficiente']);
            exit;
        }

        $existente = $db->fetch("SELECT id, quantidade FROM carrinho WHERE usuario_id = ? AND produto_id = ?", [$usuario['id'], $produtoId]);
        if ($existente) {
            $novaQtd = $existente['quantidade'] + $quantidade;
            $db->update("UPDATE carrinho SET quantidade = ? WHERE id = ?", [min($novaQtd, $produto['estoque']), $existente['id']]);
        } else {
            $db->insert("INSERT INTO carrinho (usuario_id, produto_id, quantidade) VALUES (?, ?, ?)", [$usuario['id'], $produtoId, $quantidade]);
        }

        echo json_encode(['sucesso' => true, 'mensagem' => 'Produto adicionado ao carrinho']);
        break;

    case 'listar_carrinho':
        $itens = $db->fetchAll(
            "SELECT c.id, c.quantidade, p.id as produto_id, p.nome, p.slug, p.preco, p.preco_promocional, p.imagens, p.estoque
             FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.usuario_id = ?",
            [$usuario['id']]
        );

        $total = 0;
        foreach ($itens as &$item) {
            $imagens = json_decode($item['imagens'], true);
            $item['imagem'] = $imagens[0] ?? '';
            $item['preco_atual'] = $item['preco_promocional'] ?: $item['preco'];
            $item['subtotal'] = $item['preco_atual'] * $item['quantidade'];
            $total += $item['subtotal'];
            unset($item['imagens'], $item['preco'], $item['preco_promocional']);
        }

        echo json_encode(['sucesso' => true, 'itens' => $itens, 'total' => $total]);
        break;

    case 'atualizar_quantidade':
        $itemId = (int)$_POST['item_id'];
        $quantidade = max(1, (int)$_POST['quantidade']);

        $item = $db->fetch(
            "SELECT c.id, p.estoque FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.id = ? AND c.usuario_id = ?",
            [$itemId, $usuario['id']]
        );

        if (!$item) {
            echo json_encode(['sucesso' => false, 'erro' => 'Item não encontrado']);
            exit;
        }

        if ($quantidade > $item['estoque']) {
            echo json_encode(['sucesso' => false, 'erro' => 'Estoque insuficiente']);
            exit;
        }

        $db->update("UPDATE carrinho SET quantidade = ? WHERE id = ?", [$quantidade, $itemId]);
        echo json_encode(['sucesso' => true]);
        break;

    case 'remover_item':
        $itemId = (int)$_POST['item_id'];
        $db->delete("DELETE FROM carrinho WHERE id = ? AND usuario_id = ?", [$itemId, $usuario['id']]);
        echo json_encode(['sucesso' => true]);
        break;

    case 'finalizar_pedido':
        $cep = sanitizar($_POST['cep'] ?? '');
        $endereco = sanitizar($_POST['endereco'] ?? '');
        $metodoPagamento = sanitizar($_POST['metodo_pagamento'] ?? '');

        $itens = $db->fetchAll(
            "SELECT c.quantidade, p.id, p.nome, p.preco, p.preco_promocional FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.usuario_id = ?",
            [$usuario['id']]
        );

        if (empty($itens)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Carrinho vazio']);
            exit;
        }

        $total = 0;
        foreach ($itens as &$item) {
            $preco = $item['preco_promocional'] ?: $item['preco'];
            $total += $preco * $item['quantidade'];
        }

        $codigo = 'PED-' . strtoupper(bin2hex(random_bytes(6)));

        $pedidoId = $db->insert(
            "INSERT INTO pedidos (usuario_id, codigo, total, cep_entrega, endereco_entrega, metodo_pagamento) VALUES (?, ?, ?, ?, ?, ?)",
            [$usuario['id'], $codigo, $total, $cep, $endereco, $metodoPagamento]
        );

        foreach ($itens as $item) {
            $preco = $item['preco_promocional'] ?: $item['preco'];
            $db->insert(
                "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                [$pedidoId, $item['id'], $item['quantidade'], $preco]
            );
            $db->update("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [$item['quantidade'], $item['id']]);
        }

        $db->delete("DELETE FROM carrinho WHERE usuario_id = ?", [$usuario['id']]);

        echo json_encode(['sucesso' => true, 'codigo' => $codigo, 'pedido_id' => $pedidoId]);
        break;

    default:
        echo json_encode(['sucesso' => false, 'erro' => 'Ação inválida']);
}
