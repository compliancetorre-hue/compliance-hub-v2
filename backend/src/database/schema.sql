-- ============================================================
-- COMPLIANCE HUB - Schema do Banco de Dados (PostgreSQL)
-- ============================================================

-- Extensoes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FILIAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS filiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- USUARIOS (sem dados sensiveis expostos no frontend)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,       -- bcrypt hash, NUNCA a senha em texto
  perfil VARCHAR(30) NOT NULL DEFAULT 'analista',  -- admin | gestor | analista | auditor | viewer
  filial_id UUID REFERENCES filiais(id),
  ativo BOOLEAN DEFAULT true,
  tentativas_login INTEGER DEFAULT 0,
  bloqueado_ate TIMESTAMP,
  ultimo_login TIMESTAMP,
  deve_trocar_senha BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT perfil_valido CHECK (perfil IN ('admin','gestor','analista','auditor','viewer'))
);

-- ============================================================
-- EMPRESAS MONITORADAS
-- ============================================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social VARCHAR(250) NOT NULL,
  nome_fantasia VARCHAR(250),
  cnpj VARCHAR(18),
  cnpj_formatado VARCHAR(20),
  categoria VARCHAR(100),
  uf VARCHAR(2),
  filial_id UUID REFERENCES filiais(id),
  risco_geral VARCHAR(20) DEFAULT 'Leve',  -- Leve | Medio | Grave | Gravissima
  status_rel VARCHAR(30) DEFAULT 'Ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT risco_valido CHECK (risco_geral IN ('Leve','Medio','Grave','Gravissima'))
);

-- ============================================================
-- DENUNCIAS (dados extremamente sensiveis - acesso restrito)
-- ============================================================
CREATE TABLE IF NOT EXISTS denuncias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  filial_id UUID REFERENCES filiais(id),
  setor VARCHAR(100),
  descricao TEXT NOT NULL,
  anonima BOOLEAN DEFAULT true,
  denunciante_nome VARCHAR(150),          -- NULL se anonima
  denunciante_email VARCHAR(150),         -- NULL se anonima
  perigo VARCHAR(20) DEFAULT 'Leve',
  status VARCHAR(30) DEFAULT 'Pendente',
  responsavel_id UUID REFERENCES usuarios(id),
  data_limite DATE,
  resolucao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT perigo_valido CHECK (perigo IN ('Leve','Medio','Grave','Gravissima')),
  CONSTRAINT status_valido CHECK (status IN ('Pendente','Em Analise','Encaminhada','Concluida','Arquivada'))
);

-- ============================================================
-- TAREFAS / ACOES DE COMPLIANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(300) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  prioridade VARCHAR(20) DEFAULT 'Media',
  status VARCHAR(30) DEFAULT 'A Fazer',
  responsavel_id UUID REFERENCES usuarios(id),
  filial_id UUID REFERENCES filiais(id),
  empresa_id UUID REFERENCES empresas(id),
  data_prazo DATE,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT prioridade_valida CHECK (prioridade IN ('Critica','Alta','Media','Baixa')),
  CONSTRAINT status_valido CHECK (status IN ('A Fazer','Em Andamento','Aguardando','Concluida','Cancelada'))
);

-- ============================================================
-- LOGS DE AUDITORIA (imutavel - INSERT only)
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(30) NOT NULL,    -- login | logout | create | update | delete | export | import
  usuario_id UUID REFERENCES usuarios(id),
  usuario_nome VARCHAR(150),
  descricao TEXT,
  tabela_afetada VARCHAR(50),
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip VARCHAR(45),
  user_agent VARCHAR(300),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- IMPORTANTE: revogar UPDATE e DELETE da tabela de logs
REVOKE UPDATE, DELETE ON logs_auditoria FROM PUBLIC;

-- ============================================================
-- CONFIGURACOES DO SISTEMA (sem dados sensiveis)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  editavel_por_admin BOOLEAN DEFAULT true,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDICES para performance e seguranca
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_filial ON usuarios(filial_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_protocolo ON denuncias(protocolo);
CREATE INDEX IF NOT EXISTS idx_denuncias_filial ON denuncias(filial_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON logs_auditoria(tipo);
CREATE INDEX IF NOT EXISTS idx_logs_criado_em ON logs_auditoria(criado_em);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
