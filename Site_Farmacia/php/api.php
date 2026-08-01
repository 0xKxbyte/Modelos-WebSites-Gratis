<?php
/**
 * API REST - Vitalis Farma
 * Endpoints para dados do site (produtos, servicos, etc.)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/conexao.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        case 'produtos':
            $categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : null;
            if ($categoria) {
                $data = getProdutosByCategoria($categoria);
            } else {
                $data = dbGetAll(
                    "SELECT p.*, c.nome AS categoria_nome, c.cor AS categoria_cor
                     FROM produtos p
                     JOIN categorias c ON p.categoria_id = c.id
                     WHERE p.ativo = 1
                     ORDER BY p.destaque DESC, p.nome ASC"
                );
            }
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'produto':
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                throw new Exception('ID de produto invalido');
            }
            $produto = getProdutoById($id);
            if (!$produto) {
                throw new Exception('Produto nao encontrado');
            }
            echo json_encode(['success' => true, 'data' => $produto]);
            break;

        case 'destaques':
            $limite = (int)($_GET['limite'] ?? 6);
            $data = getProdutosDestaque($limite);
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'buscar':
            $termo = $_GET['q'] ?? '';
            if (strlen($termo) < 2) {
                throw new Exception('Termo de busca deve ter pelo menos 2 caracteres');
            }
            $data = buscarProdutos($termo);
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'categorias':
            $data = getCategorias();
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'servicos':
            $data = getServicos();
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'farmaceuticos':
            $data = getFarmaceuticos();
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'banners':
            $data = getBannersAtivos();
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        case 'estatisticas':
            $data = getEstatisticas();
            echo json_encode(['success' => true, 'data' => $data]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Endpoint nao encontrado']);
            break;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
