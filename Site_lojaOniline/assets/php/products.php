<?php
require_once __DIR__ . '/db.php';

class Produtos {
    private $db;

    public function __construct() {
        $this->db = Database::getInstancia();
    }

    public function listar($categoria = null, $busca = null, $ordenar = 'destaque', $limite = 12, $pagina = 1) {
        $sql = "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.ativo = 1";
        $params = [];

        if ($categoria) {
            $sql .= " AND c.slug = ?";
            $params[] = $categoria;
        }

        if ($busca) {
            $sql .= " AND (p.nome LIKE ? OR p.descricao LIKE ?)";
            $buscaParam = "%$busca%";
            $params[] = $buscaParam;
            $params[] = $buscaParam;
        }

        switch ($ordenar) {
            case 'preco_asc': $sql .= " ORDER BY COALESCE(p.preco_promocional, p.preco) ASC"; break;
            case 'preco_desc': $sql .= " ORDER BY COALESCE(p.preco_promocional, p.preco) DESC"; break;
            case 'nome': $sql .= " ORDER BY p.nome ASC"; break;
            case 'novos': $sql .= " ORDER BY p.criado_em DESC"; break;
            case 'mais_vendidos': $sql .= " ORDER BY p.visitas DESC"; break;
            default: $sql .= " ORDER BY p.destaque DESC, p.criado_em DESC"; break;
        }

        $offset = ($pagina - 1) * $limite;
        $sql .= " LIMIT $limite OFFSET $offset";

        return $this->db->fetchAll($sql, $params);
    }

    public function buscar($termo, $limite = 10) {
        $termo = "%$termo%";
        return $this->db->fetchAll(
            "SELECT p.id, p.nome, p.slug, p.preco, p.preco_promocional, p.imagens, c.nome as categoria
             FROM produtos p JOIN categorias c ON p.categoria_id = c.id
             WHERE p.ativo = 1 AND (p.nome LIKE ? OR p.descricao LIKE ? OR c.nome LIKE ?)
             ORDER BY p.destaque DESC, p.visitas DESC LIMIT ?",
            [$termo, $termo, $termo, $limite]
        );
    }

    public function getPorSlug($slug) {
        $produto = $this->db->fetch(
            "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.slug = ? AND p.ativo = 1",
            [$slug]
        );

        if ($produto) {
            $this->db->update("UPDATE produtos SET visitas = visitas + 1 WHERE id = ?", [$produto['id']]);
        }

        return $produto;
    }

    public function getRelacionados($produtoId, $categoriaId, $limite = 4) {
        return $this->db->fetchAll(
            "SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id != ? AND p.categoria_id = ? AND p.ativo = 1 ORDER BY p.destaque DESC, RAND() LIMIT ?",
            [$produtoId, $categoriaId, $limite]
        );
    }

    public function getDestaques($limite = 8) {
        return $this->db->fetchAll(
            "SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.destaque = 1 AND p.ativo = 1 ORDER BY RAND() LIMIT ?",
            [$limite]
        );
    }

    public function getCategorias() {
        return $this->db->fetchAll("SELECT * FROM categorias ORDER BY nome");
    }

    public function getPorCategoria($categoriaSlug, $limite = 12, $pagina = 1) {
        return $this->listar($categoriaSlug, null, 'destaque', $limite, $pagina);
    }

    public function getFiltros($categoria = null, $precoMin = null, $precoMax = null, $busca = null) {
        $sql = "SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.ativo = 1";
        $params = [];

        if ($categoria) {
            $sql .= " AND c.slug = ?";
            $params[] = $categoria;
        }

        if ($precoMin !== null) {
            $sql .= " AND COALESCE(p.preco_promocional, p.preco) >= ?";
            $params[] = $precoMin;
        }

        if ($precoMax !== null) {
            $sql .= " AND COALESCE(p.preco_promocional, p.preco) <= ?";
            $params[] = $precoMax;
        }

        if ($busca) {
            $sql .= " AND (p.nome LIKE ? OR p.descricao LIKE ?)";
            $buscaParam = "%$busca%";
            $params[] = $buscaParam;
            $params[] = $buscaParam;
        }

        $sql .= " ORDER BY p.destaque DESC, p.criado_em DESC";

        return $this->db->fetchAll($sql, $params);
    }
}
