-- ============================================================
-- Database: db_advocacia
-- Sistema Profissional para Escritório de Advocacia
-- Versão: 2.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_advocacia
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_advocacia;

-- ============================================================
-- TABELA: advogados
-- ============================================================
CREATE TABLE IF NOT EXISTS advogados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    foto_url VARCHAR(500),
    oab VARCHAR(30) NOT NULL,
    especialidades TEXT,
    biografia TEXT,
    curriculo TEXT,
    instagram VARCHAR(200),
    linkedin VARCHAR(200),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: areas_atuacao
-- ============================================================
CREATE TABLE IF NOT EXISTS areas_atuacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    descricao_curta TEXT,
    descricao_completa TEXT,
    icone_svg TEXT,
    cor_destaque VARCHAR(7) DEFAULT '#C9A84C',
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: contatos (mensagens do formulário)
-- ============================================================
CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL,
    telefone VARCHAR(20),
    assunto VARCHAR(200),
    mensagem TEXT NOT NULL,
    origem VARCHAR(50) DEFAULT 'site',
    lido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    data_resposta DATETIME NULL,
    resposta TEXT,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: newsletter
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120),
    email VARCHAR(180) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_cancelamento DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: depoimentos
-- ============================================================
CREATE TABLE IF NOT EXISTS depoimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_cliente VARCHAR(120) NOT NULL,
    empresa VARCHAR(150),
    cargo VARCHAR(100),
    foto_url VARCHAR(500),
    depoimento TEXT NOT NULL,
    estrelas TINYINT DEFAULT 5,
    aprovado BOOLEAN DEFAULT FALSE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: blog
-- ============================================================
CREATE TABLE IF NOT EXISTS blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    conteudo LONGTEXT,
    resumo TEXT,
    imagem_url VARCHAR(500),
    autor_id INT,
    categoria VARCHAR(100),
    tags VARCHAR(500),
    views INT DEFAULT 0,
    publicado BOOLEAN DEFAULT FALSE,
    data_publicacao DATETIME,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES advogados(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: casos
-- ============================================================
CREATE TABLE IF NOT EXISTS casos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    resumo TEXT,
    resultado TEXT,
    data_conclusao DATE,
    confidencial BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: logs_sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    data_log DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_contatos_lido ON contatos(lido);
CREATE INDEX idx_contatos_data ON contatos(data_envio);
CREATE INDEX idx_newsletter_ativo ON newsletter(ativo);
CREATE INDEX idx_blog_publicado ON blog(publicado);
CREATE INDEX idx_blog_data ON blog(data_publicacao);
CREATE INDEX idx_depoimentos_aprovado ON depoimentos(aprovado);

-- ============================================================
-- INSERTS INICIAIS
-- ============================================================
INSERT INTO advogados (nome, email, telefone, celular, oab, especialidades, biografia) VALUES
('Dr. Ricardo Almeida', 'ricardo@ricardoalmeida.adv.br', '(11) 3333-4444', '(11) 99999-8888', 'OAB/SP 123.456',
 'Direito Civil, Direito Empresarial, Direito Trabalhista, Direito Tributário',
 'Advogado especialista em Direito Civil, Empresarial e Trabalhista, com mais de 15 anos de atuação. Formado pela USP com LL.M. em Direito Empresarial pela FGV.'),
('Dra. Juliana Costa', 'juliana@ricardoalmeida.adv.br', '(11) 3333-4444', '(11) 98888-7777', 'OAB/SP 234.567',
 'Direito de Família, Direito do Consumidor, Direito Previdenciário',
 'Advogada especializada em Direito de Família e do Consumidor, com vasta experiência em mediação de conflitos e acordos extrajudiciais.');

INSERT INTO areas_atuacao (titulo, slug, descricao_curta, descricao_completa, icone_svg, ordem) VALUES
('Direito Civil', 'direito-civil',
 'Contratos, responsabilidade civil, família, sucessões, obrigações e indenizações.',
 '<p>Atuamos em todas as áreas do Direito Civil, oferecendo assessoria completa em...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M32 4L8 16v14c0 12.4 6.4 24 24 30 17.6-6 24-17.6 24-30V16L32 4z" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M24 30l6 6 10-10" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>', 1),
('Direito Empresarial', 'direito-empresarial',
 'Constituição de empresas, contratos societários, fusões, aquisições e recuperação judicial.',
 '<p>Consultoria completa para empresas de todos os portes...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="20" width="48" height="36" rx="2" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M8 20L32 8l24 12" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M24 36h16M24 44h12" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/></svg>', 2),
('Direito Trabalhista', 'direito-trabalhista',
 'Reclamações trabalhistas, acordos, defesas em ações, direitos e deveres de empregados e empregadores.',
 '<p>Defesa dos direitos trabalhistas com atuação estratégica...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="24" r="12" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M20 44c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#C9A84C" stroke-width="2" fill="none"/></svg>', 3),
('Direito Tributário', 'direito-tributario',
 'Planejamento fiscal, contencioso administrativo e judicial, recuperação de créditos e execuções fiscais.',
 '<p>Assessoria estratégica em questões tributárias...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M24 28l8 8 8-8M32 36V20" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/></svg>', 4),
('Direito de Família', 'direito-familia',
 'Divórcio, guarda de filhos, pensão alimentícia, inventário e planejamento sucessório.',
 '<p>Atuação sensível e estratégica em questões familiares...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M16 52V28l16-12 16 12v24" stroke="#C9A84C" stroke-width="2" fill="none"/><circle cx="22" cy="40" r="4" stroke="#C9A84C" stroke-width="2" fill="none"/><circle cx="42" cy="40" r="4" stroke="#C9A84C" stroke-width="2" fill="none"/><circle cx="32" cy="28" r="4" stroke="#C9A84C" stroke-width="2" fill="none"/></svg>', 5),
('Direito do Consumidor', 'direito-consumidor',
 'Defesa do consumidor, ações contra bancos, planos de saúde, produtos e serviços.',
 '<p>Proteção dos direitos do consumidor em todas as esferas...</p>',
 '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M32 4c-8 0-14 4-14 12v8H12v36h40V24h-6v-8c0-8-6-12-14-12z" stroke="#C9A84C" stroke-width="2" fill="none"/><circle cx="32" cy="36" r="4" stroke="#C9A84C" stroke-width="2" fill="none"/><path d="M32 40v8" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/></svg>', 6);

INSERT INTO depoimentos (nome_cliente, empresa, cargo, depoimento, estrelas, aprovado) VALUES
('Carlos Eduardo Mendes', 'Mendes & Associados', 'CEO',
 'O Dr. Ricardo conduziu nosso caso com total profissionalismo. Resolveu uma questão societária complexa em tempo recorde. Recomendo fortemente.', 5, TRUE),
('Ana Lúcia Silva', 'Hospital São Lucas', 'Diretora Médica',
 'Excelente atendimento e conhecimento técnico. O Dr. Ricardo me orientou em cada etapa do processo trabalhista com clareza e segurança.', 5, TRUE),
('Fernando Oliveira', 'Oliveira Engenharia', 'Sócio-Diretor',
 'Profissionalismo e dedicação excepcionais. Nosso caso foi tratado com a seriedade que um negócio desse porte merece. Resultado excelente.', 5, TRUE),
('Mariana Campos', 'Campos Design', 'Proprietária',
 'Advocacia de alto nível com atendimento humanizado. O Dr. Ricardo entendeu nossas necessidades e encontrou a melhor solução jurídica.', 5, TRUE);

INSERT INTO blog (titulo, slug, conteudo, resumo, categoria, publicado, data_publicacao) VALUES
('Planejamento Sucessório: Protegendo o Futuro da Sua Família', 'planejamento-sucessorio',
 '<p>O planejamento sucessório é uma ferramenta essencial para garantir que seus bens sejam transmitidos de acordo com sua vontade...</p>',
 'Entenda como o planejamento sucessório pode proteger seu patrimônio e garantir tranquilidade para sua família.',
 'Direito de Família', TRUE, '2026-01-15'),
('Reforma Trabalhista: O Que Mudou e Como Impacta Seu Negócio', 'reforma-trabalhista',
 '<p>A reforma trabalhista trouxe mudanças significativas nas relações de trabalho no Brasil...</p>',
 'Principais alterações da reforma trabalhista e como adequar sua empresa às novas regras.',
 'Direito Trabalhista', TRUE, '2026-02-20'),
('Direitos do Consumidor: Saiba Como Se Proteger', 'direitos-consumidor',
 '<p>Conhecer seus direitos como consumidor é fundamental para evitar prejuízos...</p>',
 'Guia completo sobre os direitos do consumidor e como exercê-los.',
 'Direito do Consumidor', TRUE, '2026-03-10');
