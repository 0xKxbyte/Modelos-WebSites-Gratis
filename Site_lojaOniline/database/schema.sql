CREATE DATABASE IF NOT EXISTS loja_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja_online;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NULL,
    avatar VARCHAR(500) NULL,
    cep VARCHAR(9) NULL,
    endereco VARCHAR(255) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado CHAR(2) NULL,
    telefone VARCHAR(20) NULL,
    token_acesso VARCHAR(255) NULL,
    token_expiracao DATETIME NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google (google_id)
) ENGINE=InnoDB;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT NULL,
    icone_svg TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2) NULL,
    parcelas INT DEFAULT 12,
    peso_kg DECIMAL(5,2) DEFAULT 0.00,
    altura_cm DECIMAL(5,2) DEFAULT 0.00,
    largura_cm DECIMAL(5,2) DEFAULT 0.00,
    comprimento_cm DECIMAL(5,2) DEFAULT 0.00,
    estoque INT DEFAULT 0,
    imagens JSON NOT NULL,
    especificacoes JSON NULL,
    destaque BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    visitas INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    INDEX idx_categoria (categoria_id),
    INDEX idx_destaque (destaque),
    INDEX idx_preco (preco),
    FULLTEXT idx_busca (nome, descricao)
) ENGINE=InnoDB;

CREATE TABLE favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_favorito (usuario_id, produto_id)
) ENGINE=InnoDB;

CREATE TABLE carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_carrinho (usuario_id, produto_id)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('pendente','confirmado','processando','enviado','entregue','cancelado') DEFAULT 'pendente',
    total DECIMAL(10,2) NOT NULL,
    frete DECIMAL(10,2) DEFAULT 0.00,
    cep_entrega VARCHAR(9) NOT NULL,
    endereco_entrega TEXT NOT NULL,
    metodo_pagamento VARCHAR(50) NULL,
    codigo_rastreio VARCHAR(50) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    token_sessao VARCHAR(255) NOT NULL UNIQUE,
    dados_sessao JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em DATETIME NOT NULL,
    INDEX idx_token (token_sessao),
    INDEX idx_expiracao (expira_em)
) ENGINE=InnoDB;

CREATE TABLE logs_seguranca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    tipo VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    descricao TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_ip (ip_address)
) ENGINE=InnoDB;

INSERT INTO categorias (nome, slug, descricao) VALUES
('Computadores', 'computadores', 'PCs completos e workstations'),
('Notebooks', 'notebooks', 'Notebooks e ultrabooks'),
('Hardware', 'hardware', 'Peças e componentes'),
('Perifericos', 'perifericos', 'Teclados, mouses e headsets'),
('Celulares', 'celulares', 'Smartphones e acessórios'),
('Kit Tecnico', 'kit-tecnico', 'Ferramentas e kits técnicos'),
('Limpeza', 'limpeza', 'Produtos para limpeza de equipamentos'),
('Monitores', 'monitores', 'Monitores e displays');

INSERT INTO produtos (categoria_id, nome, slug, descricao, preco, preco_promocional, parcelas, peso_kg, altura_cm, largura_cm, comprimento_cm, estoque, imagens, especificacoes, destaque) VALUES
(1, 'PC Gamer Titan X', 'pc-gamer-titan-x', 'PC Gamer de alta performance com processador Intel Core i9, 32GB RAM, RTX 4090, SSD 1TB NVMe. Ideal para jogos pesados e renderização profissional.', 15999.99, 13999.99, 12, 12.5, 50, 25, 50, 15,
'["https://placehold.co/600x400/1a1a2e/e94560?text=PC+Gamer+Titan+X","https://placehold.co/600x400/1a1a2e/16213e?text=PC+Titan+X+Frente","https://placehold.co/600x400/1a1a2e/0f3460?text=PC+Titan+X+Traseira"]',
'{"Processador":"Intel Core i9-14900K","RAM":"32GB DDR5","GPU":"RTX 4090 24GB","Armazenamento":"1TB NVMe SSD","Fonte":"850W 80 Plus Gold","Placa Mae":"Z790 DDR5"}', TRUE),

(1, 'PC Workstation Pro', 'pc-workstation-pro', 'Workstation profissional para design, edição de vídeo e modelagem 3D. AMD Ryzen 9, 64GB RAM, RTX 4080.', 21999.99, 19999.99, 12, 14.0, 52, 26, 52, 8,
'["https://placehold.co/600x400/16213e/0f3460?text=Workstation+Pro","https://placehold.co/600x400/16213e/e94560?text=Workstation+Frente"]',
'{"Processador":"AMD Ryzen 9 7950X","RAM":"64GB DDR5","GPU":"RTX 4080 16GB","Armazenamento":"2TB NVMe SSD","Fonte":"1000W 80 Plus Platinum"}', TRUE),

(2, 'Notebook UltraBook Pro 15', 'notebook-ultrabook-pro-15', 'Notebook ultrafino com tela 15.6\" 4K OLED, Intel Core i7, 16GB RAM, SSD 512GB. Bateria de longa duração.', 8499.99, 7799.99, 12, 1.8, 1.8, 35, 24, 25,
'["https://placehold.co/600x400/0f3460/e94560?text=UltraBook+Pro","https://placehold.co/600x400/0f3460/16213e?text=UltraBook+Aberto"]',
'{"Processador":"Intel Core i7-13700H","RAM":"16GB LPDDR5","Tela":"15.6\" 4K OLED","Armazenamento":"512GB NVMe SSD","Bateria":"8 horas","Peso":"1.8kg"}', TRUE),

(3, 'RTX 5090 Phantom', 'rtx-5090-phantom', 'Placa de vídeo topo de linha NVIDIA GeForce RTX 5090 com 32GB GDDR7, arquitetura Blackwell, ray tracing em tempo real.', 12999.99, 11999.99, 12, 2.5, 6, 35, 15, 10,
'["https://placehold.co/600x400/e94560/1a1a2e?text=RTX+5090","https://placehold.co/600x400/e94560/16213e?text=RTX+5090+Lateral"]',
'{"GPU":"NVIDIA RTX 5090","VRAM":"32GB GDDR7","Clock":"2.9GHz Boost","TDP":"450W","Saidas":"3x DP 2.1, 1x HDMI 2.1"}', TRUE),

(3, 'Processador Intel Core i9-14900K', 'intel-core-i9-14900k', 'Processador Intel Core i9-14900K, 24 núcleos, 32 threads, 6.0GHz Turbo, LGA1700.', 4299.99, 3899.99, 10, 0.3, 1, 4, 4, 30,
'["https://placehold.co/600x400/1a1a2e/0f3460?text=i9-14900K","https://placehold.co/600x400/1a1a2e/e94560?text=i9+Caixa"]',
'{"Nucleos":"24 (8P + 16E)","Threads":"32","Turbo":"6.0GHz","Socket":"LGA1700","TDP":"125W (253W Turbo)"}', TRUE),

(4, 'Teclado Mecânico RGB Phantom', 'teclado-mecanico-rgb-phantom', 'Teclado mecânico full size com switches Cherry MX Blue, RGB personalizável, construção em alumínio.', 599.99, 499.99, 6, 1.2, 4, 44, 14, 50,
'["https://placehold.co/600x400/16213e/e94560?text=Teclado+Phantom","https://placehold.co/600x400/16213e/0f3460?text=Teclado+RGB"]',
'{"Switch":"Cherry MX Blue","Layout":"Full Size 104 teclas","RGB":"Por tecla","Material":"Alumínio escovado","Conexão":"USB-C removível"}', TRUE),

(4, 'Mouse Gamer Pro X', 'mouse-gamer-pro-x', 'Mouse gamer sem fio com sensor óptico 32K DPI, 8 botões programáveis, bateria 70h.', 399.99, 349.99, 6, 0.1, 4, 6, 12, 80,
'["https://placehold.co/600x400/e94560/1a1a2e?text=Mouse+Pro+X","https://placehold.co/600x400/e94560/16213e?text=Mouse+Lateral"]',
'{"Sensor":"Optical 32K DPI","Botões":"8 programáveis","Conexão":"2.4GHz / Bluetooth 5.0","Bateria":"70 horas","Peso":"58g"}', TRUE),

(5, 'Smartphone Galaxy Ultra 25', 'smartphone-galaxy-ultra-25', 'Smartphone topo de linha com tela 6.9\" Dynamic AMOLED 2X, 512GB, câmera 200MP, S-Pen integrada.', 7999.99, 7299.99, 12, 0.25, 0.8, 8, 16, 20,
'["https://placehold.co/600x400/0f3460/1a1a2e?text=Galaxy+Ultra","https://placehold.co/600x400/0f3460/e94560?text=Galaxy+Traseira"]',
'{"Tela":"6.9\" Dynamic AMOLED 2X","Armazenamento":"512GB","Câmera":"200MP + 50MP + 12MP","RAM":"12GB","Bateria":"5000mAh"}', TRUE),

(6, 'Kit Técnico Profissional 150 Peças', 'kit-tecnico-profissional', 'Kit técnico completo com 150 ferramentas para montagem e manutenção de equipamentos eletrônicos.', 299.99, 249.99, 5, 3.5, 10, 30, 20, 40,
'["https://placehold.co/600x400/16213e/0f3460?text=Kit+Técnico","https://placehold.co/600x400/16213e/e94560?text=Ferramentas"]',
'{"Peças":"150","Tipo":"Chaves, pinças, pulseira antiestática","Material":"Aço inoxidável + cabo de borracha","Estojo":"Em alumínio"}', TRUE),

(7, 'Kit Limpeza Eletrônicos Pro', 'kit-limpeza-eletronicos-pro', 'Kit completo para limpeza de equipamentos eletrônicos: spray, pano microfibra, pincel antiestático, álcool isopropílico.', 89.99, 69.99, 3, 0.5, 8, 15, 10, 100,
'["https://placehold.co/600x400/e94560/0f3460?text=Kit+Limpeza","https://placehold.co/600x400/e94560/1a1a2e?text=Produtos+Limpeza"]',
'{"Itens":"6","Spray":"200ml","Panos":"2 microfibra","Álcool":"Isopropílico 99.9% 500ml"}', FALSE),

(8, 'Monitor 32\" 4K HDR1000', 'monitor-32-4k-hdr1000', 'Monitor profissional 32\" 4K UHD, painel IPS, HDR1000, 144Hz, 1ms, compatível com G-Sync e FreeSync.', 4999.99, 4499.99, 12, 7.5, 50, 73, 25, 12,
'["https://placehold.co/600x400/1a1a2e/e94560?text=Monitor+32+4K","https://placehold.co/600x400/1a1a2e/16213e?text=Monitor+Tela"]',
'{"Tamanho":"32\"","Resolução":"4K UHD (3840x2160)","Painel":"IPS","HDR":"HDR1000","Taxa":"144Hz","Tempo":"1ms"}', TRUE),

(3, 'SSD NVMe 2TB SpeedForce', 'ssd-nvme-2tb-speedforce', 'SSD NVMe M.2 PCIe 5.0, velocidades de leitura 12.000MB/s e gravação 10.000MB/s, ideal para jogos e trabalho pesado.', 1599.99, 1399.99, 8, 0.02, 0.2, 2, 8, 60,
'["https://placehold.co/600x400/0f3460/e94560?text=SSD+2TB","https://placehold.co/600x400/0f3460/1a1a2e?text=SSD+NVMe"]',
'{"Capacidade":"2TB","Interface":"PCIe 5.0 NVMe","Leitura":"12.000MB/s","Gravação":"10.000MB/s","Formato":"M.2 2280"}', FALSE);
