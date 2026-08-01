-- =====================================================
-- IRON GYM - Banco de Dados Completo
-- Sistema de Gerenciamento da Academia
-- =====================================================

CREATE DATABASE IF NOT EXISTS iron_gym
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE iron_gym;

-- =====================================================
-- Tabela: contatos
-- Armazena mensagens do formulario de contato
-- =====================================================
CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    interesse VARCHAR(50) DEFAULT NULL,
    mensagem TEXT NOT NULL,
    lido TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lido (lido),
    INDEX idx_created_at (created_at),
    INDEX idx_interesse (interesse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: alunos
-- Cadastro de alunos da academia
-- =====================================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20) DEFAULT NULL,
    data_nascimento DATE DEFAULT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    celular VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) DEFAULT NULL,
    bairro VARCHAR(100) DEFAULT NULL,
    cidade VARCHAR(100) DEFAULT 'Sao Paulo',
    estado VARCHAR(2) DEFAULT 'SP',
    cep VARCHAR(9) DEFAULT NULL,
    sexo ENUM('M', 'F', 'O') DEFAULT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    status ENUM('ativo', 'inativo', 'trancado', 'cancelado') NOT NULL DEFAULT 'ativo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_nome (nome),
    INDEX idx_cpf (cpf),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: planos
-- Planos de assinatura oferecidos
-- =====================================================
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT DEFAULT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_meses INT NOT NULL DEFAULT 1,
    modalidades TEXT DEFAULT NULL COMMENT 'JSON array de modalidades inclusas',
    limite_diario INT DEFAULT NULL COMMENT 'NULL = ilimitado',
    acesso_horario ENUM('comercial', 'estendido', '24h') NOT NULL DEFAULT 'comercial',
    personal_incluso TINYINT(1) NOT NULL DEFAULT 0,
    avaliacao_fisica TINYINT(1) NOT NULL DEFAULT 0,
    destaque TINYINT(1) NOT NULL DEFAULT 0,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo),
    INDEX idx_destaque (destaque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir planos padrao
INSERT INTO planos (nome, descricao, preco, duracao_meses, modalidades, acesso_horario, personal_incluso, avaliacao_fisica, destaque, ativo) VALUES
('Basico', 'Musculacao liberada em horario comercial com acesso a area de cardio.', 89.90, 1, '[\"musculacao\",\"cardio\"]', 'comercial', 0, 0, 0, 1),
('Premium', 'Todas as modalidades, horario estendido, aulas coletivas ilimitadas e avaliacao fisica mensal.', 129.90, 1, '[\"musculacao\",\"crossfit\",\"funcional\",\"yoga\",\"pilates\",\"cardio\",\"spinning\"]', 'estendido', 0, 1, 1, 1),
('VIP', 'Todos os beneficios, personal trainer incluso, acesso 24 horas e area VIP exclusiva.', 199.90, 1, '[\"musculacao\",\"crossfit\",\"funcional\",\"yoga\",\"pilates\",\"cardio\",\"spinning\",\"vip\"]', '24h', 1, 1, 0, 1);

-- =====================================================
-- Tabela: matriculas
-- Vinculo entre alunos e planos
-- =====================================================
CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    plano_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE DEFAULT NULL,
    valor_pago DECIMAL(10, 2) NOT NULL,
    forma_pagamento ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia') NOT NULL DEFAULT 'pix',
    status ENUM('ativa', 'cancelada', 'expirada', 'trancada') NOT NULL DEFAULT 'ativa',
    observacoes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_aluno (aluno_id),
    INDEX idx_plano (plano_id),
    INDEX idx_data_fim (data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: profissionais
-- Equipe de professores e treinadores
-- =====================================================
CREATE TABLE IF NOT EXISTS profissionais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cref VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100) DEFAULT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    biografia TEXT DEFAULT NULL,
    modalidades TEXT DEFAULT NULL COMMENT 'JSON array de modalidades que ministra',
    horario_trabalho TEXT DEFAULT NULL COMMENT 'JSON com horarios de trabalho',
    status ENUM('ativo', 'inativo', 'ferias') NOT NULL DEFAULT 'ativo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_especialidade (especialidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir profissionais padrao
INSERT INTO profissionais (nome, email, cref, especialidade, biografia, modalidades, status) VALUES
('Carlos Oliveira', 'carlos@irongym.com.br', 'CREF-001-G/SP', 'Head Coach', 'Ex-atleta profissional com mais de 20 anos de experiencia. Fundador da Iron Gym.', '[\"musculacao\",\"funcional\"]', 'ativo'),
('Ana Silva', 'ana@irongym.com.br', 'CREF-002-G/SP', 'Crossfit Coach', 'Campea nacional de crossfit 2022. Especialista em treinos de alta intensidade.', '[\"crossfit\",\"funcional\"]', 'ativo'),
('Rafael Costa', 'rafael@irongym.com.br', 'CREF-003-G/SP', 'Personal Trainer', 'Especialista em rehabilitacao e treinamento funcional.', '[\"musculacao\",\"personal\"]', 'ativo'),
('Julia Martins', 'julia@irongym.com.br', 'CREF-004-G/SP', 'Yoga & Pilates', 'Instrutora certificada com formacao internacional.', '[\"yoga\",\"pilates\"]', 'ativo');

-- =====================================================
-- Tabela: aulas
-- Grade de aulas oferecidas
-- =====================================================
CREATE TABLE IF NOT EXISTS aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT DEFAULT NULL,
    modalidade VARCHAR(50) NOT NULL,
    nivel ENUM('iniciante', 'intermediario', 'avancado', 'todos') NOT NULL DEFAULT 'todos',
    capacidade_maxima INT NOT NULL DEFAULT 20,
    duracao_minutos INT NOT NULL DEFAULT 60,
    cor_tag VARCHAR(7) DEFAULT '#0066ff',
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_modalidade (modalidade),
    INDEX idx_nivel (nivel),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir aulas padrao
INSERT INTO aulas (nome, descricao, modalidade, nivel, capacidade_maxima, duracao_minutos) VALUES
('Crossfit Avancado', 'Treino de crossfit nivel avancado com foco em levantamento olimpico.', 'crossfit', 'avancado', 20, 60),
('Funcional Intermediario', 'Treino funcional para alunos com experiencia previa.', 'funcional', 'intermediario', 25, 60),
('Musculacao Iniciante', 'Aula de musculacao guiada para iniciantes.', 'musculacao', 'iniciante', 30, 60),
('Yoga Iniciante', 'Aula de yoga para iniciantes, com posturas basicas e respiracao.', 'yoga', 'iniciante', 25, 60),
('Pilates Intermediario', 'Pilates para alunos com experiencia previa.', 'pilates', 'intermediario', 15, 60),
('Spinning Avancado', 'Aula de spinning de alta intensidade.', 'spinning', 'avancado', 20, 60);

-- =====================================================
-- Tabela: horarios_aulas
-- Agendamento semanal das aulas
-- =====================================================
CREATE TABLE IF NOT EXISTS horarios_aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    profissional_id INT DEFAULT NULL,
    dia_semana TINYINT NOT NULL COMMENT '0=Domingo, 1=Segunda, ..., 6=Sabado',
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    sala VARCHAR(50) DEFAULT NULL,
    vagas_disponiveis INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE SET NULL,
    INDEX idx_dia_semana (dia_semana),
    INDEX idx_hora_inicio (hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: presencas
-- Registro de presenca dos alunos
-- =====================================================
CREATE TABLE IF NOT EXISTS presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    data DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_saida TIME DEFAULT NULL,
    aula_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,
    INDEX idx_data (data),
    INDEX idx_aluno_data (aluno_id, data),
    UNIQUE KEY uk_aluno_data (aluno_id, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: pagamentos
-- Historico de pagamentos dos alunos
-- =====================================================
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula_id INT NOT NULL,
    aluno_id INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE DEFAULT NULL,
    forma_pagamento ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia') NOT NULL DEFAULT 'pix',
    status ENUM('pendente', 'pago', 'atrasado', 'cancelado', 'estornado') NOT NULL DEFAULT 'pendente',
    comprovante VARCHAR(255) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_data_vencimento (data_vencimento),
    INDEX idx_aluno (aluno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: avaliacoes_fisicas
-- Avaliacoes fisicas dos alunos
-- =====================================================
CREATE TABLE IF NOT EXISTS avaliacoes_fisicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    profissional_id INT DEFAULT NULL,
    data_avaliacao DATE NOT NULL,
    peso DECIMAL(5, 2) DEFAULT NULL COMMENT 'kg',
    altura DECIMAL(3, 2) DEFAULT NULL COMMENT 'metros',
    imc DECIMAL(4, 2) GENERATED ALWAYS AS (peso / (altura * altura)) STORED,
    percentual_gordura DECIMAL(4, 1) DEFAULT NULL,
    massa_magra DECIMAL(5, 2) DEFAULT NULL,
    massa_gorda DECIMAL(5, 2) DEFAULT NULL,
    circunferencia_cintura DECIMAL(4, 1) DEFAULT NULL,
    circunferencia_quadril DECIMAL(4, 1) DEFAULT NULL,
    circunferencia_braco DECIMAL(4, 1) DEFAULT NULL,
    circunferencia_coxa DECIMAL(4, 1) DEFAULT NULL,
    pressao_arterial VARCHAR(10) DEFAULT NULL,
    frequencia_cardiaca_repouso INT DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE SET NULL,
    INDEX idx_aluno (aluno_id),
    INDEX idx_data (data_avaliacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: equipamentos
-- Inventario de equipamentos da academia
-- =====================================================
CREATE TABLE IF NOT EXISTS equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria ENUM('cardio', 'musculacao', 'crossfit', 'funcional', 'pilates', 'yoga', 'outro') NOT NULL,
    fabricante VARCHAR(100) DEFAULT NULL,
    modelo VARCHAR(100) DEFAULT NULL,
    numero_serie VARCHAR(100) DEFAULT NULL UNIQUE,
    data_aquisicao DATE DEFAULT NULL,
    valor_aquisicao DECIMAL(10, 2) DEFAULT NULL,
    vida_util_anos INT DEFAULT NULL,
    status ENUM('disponivel', 'em_manutencao', 'danificado', 'descartado') NOT NULL DEFAULT 'disponivel',
    localizacao VARCHAR(100) DEFAULT NULL,
    ultima_manutencao DATE DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: usuarios_sistema
-- Usuarios do sistema administrativo
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel ENUM('admin', 'gerente', 'recepcao', 'professor', 'financeiro') NOT NULL DEFAULT 'recepcao',
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    ultimo_acesso DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nivel (nivel),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuario admin padrao (senha: admin123)
INSERT INTO usuarios_sistema (nome, email, senha, nivel) VALUES
('Administrador', 'admin@irongym.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =====================================================
-- Tabela: log_acessos
-- Registro de acessos ao sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS log_acessos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT DEFAULT NULL,
    ip VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: configuracoes
-- Configuracoes gerais do sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    tipo ENUM('string', 'int', 'boolean', 'json', 'decimal') NOT NULL DEFAULT 'string',
    descricao VARCHAR(255) DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chave (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configuracoes padrao
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
('academia_nome', 'Iron Gym', 'string', 'Nome da academia'),
('academia_endereco', 'Av. Paulista, 1000 - Sao Paulo - SP', 'string', 'Endereco da academia'),
('academia_telefone', '(11) 99999-9999', 'string', 'Telefone de contato'),
('academia_email', 'contato@irongym.com.br', 'string', 'E-mail de contato'),
('academia_horario_seg_sex', '05:30 - 22:00', 'string', 'Horario de funcionamento segunda a sexta'),
('academia_horario_sab', '07:00 - 14:00', 'string', 'Horario de funcionamento sabado'),
('academia_horario_dom', 'Fechado', 'string', 'Horario de funcionamento domingo'),
('timer_promocao_horas', '24', 'int', 'Horas do timer promocional'),
('timer_promocao_minutos', '59', 'int', 'Minutos do timer promocional'),
('timer_promocao_segundos', '59', 'int', 'Segundos do timer promocional'),
('vagas_maximas_aula', '30', 'int', 'Capacidade maxima padrao de aulas'),
('tolerancia_atraso_minutos', '15', 'int', 'Tolerancia de atraso em minutos'),
('dias_renovacao_automática', '3', 'int', 'Dias antes do vencimento para renovacao automatica');

-- =====================================================
-- View: vw_alunos_ativos
-- Visao de alunos com matricula ativa
-- =====================================================
CREATE OR REPLACE VIEW vw_alunos_ativos AS
SELECT 
    a.id,
    a.nome,
    a.email,
    a.cpf,
    a.telefone,
    a.celular,
    a.status,
    m.plano_id,
    p.nome AS plano_nome,
    p.preco AS plano_valor,
    m.data_inicio,
    m.data_fim
FROM alunos a
INNER JOIN matriculas m ON a.id = m.aluno_id AND m.status = 'ativa'
INNER JOIN planos p ON m.plano_id = p.id
WHERE a.status = 'ativo';

-- =====================================================
-- View: vw_faturamento_mensal
-- Visao de faturamento por mes
-- =====================================================
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
    DATE_FORMAT(data_pagamento, '%Y-%m') AS mes,
    COUNT(*) AS total_pagamentos,
    SUM(valor) AS faturamento_total,
    AVG(valor) AS ticket_medio
FROM pagamentos
WHERE status = 'pago'
GROUP BY DATE_FORMAT(data_pagamento, '%Y-%m')
ORDER BY mes DESC;

-- =====================================================
-- View: vw_presencas_hoje
-- Visao de presencas do dia atual
-- =====================================================
CREATE OR REPLACE VIEW vw_presencas_hoje AS
SELECT 
    pr.id,
    a.nome AS aluno_nome,
    a.foto AS aluno_foto,
    pr.data,
    pr.hora_entrada,
    pr.hora_saida,
    au.nome AS aula_nome,
    p.nome AS profissional_nome
FROM presencas pr
INNER JOIN alunos a ON pr.aluno_id = a.id
LEFT JOIN aulas au ON pr.aula_id = au.id
LEFT JOIN profissionais p ON au.id IN (
    SELECT ha.aula_id FROM horarios_aulas ha WHERE ha.dia_semana = DAYOFWEEK(pr.data) - 1
)
WHERE pr.data = CURDATE()
ORDER BY pr.hora_entrada DESC;

-- =====================================================
-- View: vw_aniversariantes_mes
-- Aniversariantes do mes atual
-- =====================================================
CREATE OR REPLACE VIEW vw_aniversariantes_mes AS
SELECT 
    id,
    nome,
    email,
    celular,
    DATE_FORMAT(data_nascimento, '%d/%m') AS data_aniversario,
    TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) AS idade
FROM alunos
WHERE MONTH(data_nascimento) = MONTH(CURDATE())
  AND status = 'ativo'
ORDER BY DAY(data_nascimento) ASC;

-- =====================================================
-- Procedure: sp_registrar_presenca
-- Registra a entrada/saida do aluno
-- =====================================================
DELIMITER //

CREATE OR REPLACE PROCEDURE sp_registrar_presenca(
    IN p_aluno_id INT,
    IN p_aula_id INT DEFAULT NULL
)
BEGIN
    DECLARE v_presenca_id INT;
    
    -- Verificar se ja existe presenca hoje
    SELECT id INTO v_presenca_id
    FROM presencas
    WHERE aluno_id = p_aluno_id AND data = CURDATE();
    
    IF v_presenca_id IS NULL THEN
        -- Registrar entrada
        INSERT INTO presencas (aluno_id, data, hora_entrada, aula_id)
        VALUES (p_aluno_id, CURDATE(), CURTIME(), p_aula_id);
    ELSE
        -- Registrar saida
        UPDATE presencas
        SET hora_saida = CURTIME(),
            aula_id = COALESCE(p_aula_id, aula_id)
        WHERE id = v_presenca_id;
    END IF;
END //

-- =====================================================
-- Procedure: sp_gerar_mensalidades
-- Gera as mensalidades do mes seguinte para alunos ativos
-- =====================================================

CREATE OR REPLACE PROCEDURE sp_gerar_mensalidades()
BEGIN
    DECLARE v_aluno_id INT;
    DECLARE v_matricula_id INT;
    DECLARE v_plano_valor DECIMAL(10,2);
    DECLARE v_proximo_vencimento DATE;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur CURSOR FOR
        SELECT a.id, m.id, p.preco, m.data_fim
        FROM alunos a
        INNER JOIN matriculas m ON a.id = m.aluno_id AND m.status = 'ativa'
        INNER JOIN planos p ON m.plano_id = p.id
        WHERE a.status = 'ativo';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_aluno_id, v_matricula_id, v_plano_valor, v_proximo_vencimento;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Verificar se ja existe pagamento para o proximo mes
        IF NOT EXISTS (
            SELECT 1 FROM pagamentos
            WHERE aluno_id = v_aluno_id
              AND matricula_id = v_matricula_id
              AND data_vencimento = v_proximo_vencimento
        ) THEN
            INSERT INTO pagamentos (matricula_id, aluno_id, valor, data_vencimento, status)
            VALUES (v_matricula_id, v_aluno_id, v_plano_valor, v_proximo_vencimento, 'pendente');
        END IF;
    END LOOP;
    
    CLOSE cur;
END //

-- =====================================================
-- Trigger: tg_aluno_matricula
-- Atualiza status do aluno ao criar matricula
-- =====================================================

CREATE OR REPLACE TRIGGER tg_aluno_matricula
AFTER INSERT ON matriculas
FOR EACH ROW
BEGIN
    UPDATE alunos SET status = 'ativo' WHERE id = NEW.aluno_id;
END //

-- =====================================================
-- Trigger: tg_pagamento_pago
-- Atualiza data de pagamento ao marcar como pago
-- =====================================================

CREATE OR REPLACE TRIGGER tg_pagamento_pago
BEFORE UPDATE ON pagamentos
FOR EACH ROW
BEGIN
    IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
        SET NEW.data_pagamento = CURDATE();
    END IF;
END //

DELIMITER ;

-- =====================================================
-- Event: ev_gerar_mensalidades
-- Executa todo dia 1 de cada mes
-- =====================================================
DELIMITER //

CREATE OR REPLACE EVENT ev_gerar_mensalidades
ON SCHEDULE EVERY 1 MONTH
STARTS '2026-01-01 00:00:00'
DO
BEGIN
    CALL sp_gerar_mensalidades();
END //

-- =====================================================
-- Event: ev_atualizar_status_matriculas
-- Atualiza matriculas vencidas diariamente
-- =====================================================

CREATE OR REPLACE EVENT ev_atualizar_status_matriculas
ON SCHEDULE EVERY 1 DAY
STARTS '2026-01-01 00:00:01'
DO
BEGIN
    UPDATE matriculas
    SET status = 'expirada'
    WHERE data_fim < CURDATE() AND status = 'ativa';
    
    UPDATE pagamentos
    SET status = 'atrasado'
    WHERE data_vencimento < CURDATE() AND status = 'pendente';
END //

DELIMITER ;

-- =====================================================
-- Grants: Permissoes de acesso
-- =====================================================
-- CREATE USER IF NOT EXISTS 'iron_gym_user'@'localhost' IDENTIFIED BY 'Ir0nGym@2026';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON iron_gym.* TO 'iron_gym_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE iron_gym.sp_registrar_presenca TO 'iron_gym_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE iron_gym.sp_gerar_mensalidades TO 'iron_gym_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
