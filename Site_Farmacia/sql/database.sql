-- ============================================================
-- BANCO DE DADOS: vitalis_farma
-- SISTEMA DE GESTAO FARMACEUTICA
-- FARMACIA FICTICIA: VITALIS FARMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS vitalis_farma
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE vitalis_farma;

-- ============================================================
-- TABELA: categorias
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(255),
  cor VARCHAR(7),
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nome VARCHAR(200) NOT NULL,
  principio_ativo VARCHAR(200),
  descricao TEXT,
  indicacao TEXT,
  contraindicacao TEXT,
  dosagem VARCHAR(100),
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  estoque INT DEFAULT 0,
  precisa_receita TINYINT(1) DEFAULT 0,
  imagem VARCHAR(255),
  destaque TINYINT(1) DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: servicos
-- ============================================================
CREATE TABLE IF NOT EXISTS servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  beneficios TEXT,
  icone VARCHAR(255),
  cor VARCHAR(7),
  preco DECIMAL(10,2),
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  data_nascimento DATE,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(50),
  cep VARCHAR(9),
  senha_hash VARCHAR(255),
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: mensagens (contato)
-- ============================================================
CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(20),
  assunto VARCHAR(255),
  mensagem TEXT NOT NULL,
  lida TINYINT(1) DEFAULT 0,
  respondida TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  nome_cliente VARCHAR(200) NOT NULL,
  email_cliente VARCHAR(200) NOT NULL,
  telefone_cliente VARCHAR(20),
  endereco_entrega TEXT,
  forma_pagamento VARCHAR(50),
  status ENUM('pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
  total DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: itens_pedido
-- ============================================================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT,
  nome_produto VARCHAR(200) NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: farmaceuticos (equipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS farmaceuticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  cargo VARCHAR(100),
  foto VARCHAR(255),
  biografia TEXT,
  crf VARCHAR(50) UNIQUE,
  email VARCHAR(200),
  especialidades TEXT,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: banners
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200),
  subtitulo VARCHAR(300),
  imagem VARCHAR(255),
  link VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- INSERTS - DADOS INICIAIS
-- ============================================================

-- CATEGORIAS
INSERT INTO categorias (nome, descricao, icone, cor) VALUES
('Medicamentos', 'Medicamentos com e sem receita medica', 'fa-capsules', '#FF6B6B'),
('Dermocosmeticos', 'Produtos para cuidados com a pele', 'fa-spa', '#4ECDC4'),
('Vitaminas', 'Vitaminas e suplementos alimentares', 'fa-leaf', '#FFE66D'),
('Higiene', 'Produtos de higiene pessoal', 'fa-soap', '#2C3E50'),
('Infantil', 'Produtos para bebes e criancas', 'fa-baby', '#FF6B6B'),
('Genericos', 'Medicamentos genericos com melhor custo-beneficio', 'fa-pills', '#4ECDC4');

-- SERVIÇOS
INSERT INTO servicos (nome, descricao, beneficios, icone, cor, preco) VALUES
('Acompanhamento Farmaceutico', 'Acompanhamento personalizado do uso de medicamentos', 'Otimizacao do tratamento;Prevencao de interacoes medicamentosas;Acompanhamento continuo', 'fa-user-md', '#FF6B6B', 89.90),
('Perfil Lipidico', 'Analise completa do perfil lipidico com resultados rapidos', 'Resultados em 24h;Acompanhamento especializado;Orientacao nutricional', 'fa-heartbeat', '#4ECDC4', 59.90),
('Afericao de Pressao', 'Medicao de pressao arterial com equipamentos modernos', 'Resultados imediatos;Historico mensal;Orientacao personalizada', 'fa-heart', '#FFE66D', 19.90),
('Teste de Glicemia', 'Monitoramento de niveis de glicose no sangue', 'Resultados rapidos;Orientacao nutricional;Acompanhamento continuo', 'fa-tint', '#2C3E50', 14.90),
('Aplicacao de Injetaveis', 'Aplicacao segura de medicamentos injetaveis', 'Profissionais capacitados;Material esterilizado;Acompanhamento pos-aplicacao', 'fa-syringe', '#FF6B6B', 29.90),
('Orientacao Farmaceutica', 'Orientacao profissional sobre uso correto de medicamentos', 'Esclarecimento de duvidas;Uso racional de medicamentos;Prevencao de automedicacao', 'fa-comments', '#4ECDC4', 0.00);

-- FARMACÊUTICOS
INSERT INTO farmaceuticos (nome, cargo, biografia, crf, email, especialidades) VALUES
('Dra. Ana Beatriz Oliveira', 'Farmaceutica Chefe', 'Doutora em Ciencias Farmaceuticas pela USP com mais de 15 anos de experiencia na area clinica e hospitalar. Especialista em farmacia clinica e atencao farmaceutica.', 'CRF-SP 45231', 'ana.oliveira@vitalisfarma.com.br', 'Farmacia Clinica;Atencao Farmaceutica;Farmacovigilancia'),
('Dr. Carlos Eduardo Mendes', 'Farmaceutico Clinico', 'Mestre em Farmacologia Clinica pela UNIFESP. Experiencia em farmacia hospitalar e acompanhamento de tratamentos complexos.', 'CRF-SP 37892', 'carlos.mendes@vitalisfarma.com.br', 'Farmacologia Clinica;Farmacia Hospitalar;Oncologia'),
('Dra. Marina Santos Lima', 'Farmaceutica Oncologica', 'Especialista em Farmacia Oncologica pelo Hospital Sirio-Libanes. Dedica-se ao cuidado de pacientes em tratamento oncológico.', 'CRF-SP 56123', 'marina.lima@vitalisfarma.com.br', 'Farmacia Oncologica;Cuidados Paliativos;Dispensacao de Medicamentos Especiais'),
('Dr. Ricardo Alves Neto', 'Farmaceutico Homeopata', 'Especialista em Homeopatia e Farmacia Natural. Defensor do uso racional de medicamentos e praticas integrativas.', 'CRF-SP 23456', 'ricardo.neto@vitalisfarma.com.br', 'Homeopatia;Farmacia Natural;Fitoterapia');

-- PRODUTOS (exemplos)
INSERT INTO produtos (categoria_id, nome, principio_ativo, descricao, indicacao, dosagem, preco, estoque, precisa_receita, destaque) VALUES
(1, 'Paracetamol 750mg', 'Paracetamol', 'Analgesico e antitérmico de acao rapida', 'Dores leves a moderadas e febre', '1 comprimido a cada 6h', 15.90, 500, 0, 1),
(1, 'Amoxicilina 500mg', 'Amoxicilina', 'Antibiotico de amplo espectro', 'Infeccoes bacterianas', '1 capsula a cada 8h', 32.50, 200, 1, 1),
(2, 'Protetor Solar FPS 60', 'Filtros solares', 'Protecao solar de alta performance com textura leve', 'Protecao contra raios UVA/UVB', 'Aplicar 30 min antes da exposicao', 89.90, 150, 0, 1),
(2, 'Hidratante Facial 50ml', 'Acido Hialuronico', 'Hidratacao intensa com acao antissinais', 'Pele ressecada e sem viço', 'Aplicar 2x ao dia', 129.90, 100, 0, 0),
(3, 'Vitamina C 1000mg', 'Acido Ascorbico', 'Suplemento de vitamina C com acao antioxidante', 'Fortalecimento imunologico', '1 comprimido ao dia', 45.90, 300, 0, 1),
(3, 'Omega 3 1000mg', 'Oleo de Peixe', 'Suplemento de acidos graxos essenciais', 'Saude cardiovascular', '1 capsula ao dia', 67.90, 250, 0, 0),
(4, 'Sabonete Antiseptico 250ml', 'Clorexidina', 'Sabonete liquido com acao antimicrobiana', 'Higienizacao diaria', 'Uso diario', 22.90, 400, 0, 0),
(4, 'Alcool Gel 500ml', 'Etanol 70%', 'Antisseptico para maos com glicerina', 'Higienizacao de maos', 'Aplicar nas maos ate secar', 12.90, 600, 0, 0),
(5, 'Fralda Descartavel XXG', 'Celulose', 'Fralda com alta absorcao e barreira antuvazamento', 'Higiene infantil', 'Trocar a cada 4h', 52.90, 200, 0, 0),
(5, 'Pomada para Assaduras 100g', 'Oleo de Amendoas', 'Protecao e tratamento de assaduras', 'Assaduras em bebes', 'Aplicar a cada troca', 34.90, 180, 0, 0),
(6, 'Losartana Potassica 50mg', 'Losartana', 'Anti-hipertensivo generico', 'Hipertensao arterial', '1 comprimido ao dia', 18.90, 350, 1, 0),
(6, 'Omeprazol 20mg', 'Omeprazol', 'Inibidor da bomba de protons generico', 'Gastrite e refluxo', '1 capsula em jejum', 22.90, 280, 0, 0);

-- BANNERS
INSERT INTO banners (titulo, subtitulo, link, ordem, ativo) VALUES
('Cuidado que Transforma Vidas', 'Na Vitalis Farma, sua saude e nossa maior prioridade. Oferecemos atendimento humanizado e medicamentos de qualidade.', '/pages/produtos.html', 1, 1),
('Novos Dermocosmeticos', 'Descubra nossa linha completa de cuidados com a pele. Produtos importados com os melhores ativos.', '/pages/produtos.html', 2, 1),
('Acompanhamento Farmaceutico', 'Agende seu acompanhamento personalizado com nossos farmaceuticos especialistas. Gratuito na primeira consulta.', '/pages/servicos.html', 3, 1);
