-- =====================================================================
-- PORTAL DE ACHADOS E PERDIDOS - SCHEMA
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- ENUMS ----------
CREATE TYPE role_usuario         AS ENUM ('ADMIN', 'ALUNO');
CREATE TYPE tipo_item            AS ENUM ('PERDIDO', 'ENCONTRADO');
CREATE TYPE status_item          AS ENUM ('ABERTO', 'EM_NEGOCIACAO', 'DEVOLVIDO', 'CANCELADO', 'EXPIRADO');
CREATE TYPE status_reivindicacao AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA');
CREATE TYPE status_mediacao      AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'RESOLVIDO');

-- ---------- 1. USUARIOS ----------
CREATE TABLE usuarios (
  id              BIGSERIAL PRIMARY KEY,
  nome            VARCHAR(255) NOT NULL,
  email           CITEXT       NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  telefone        VARCHAR(50),
  role            role_usuario NOT NULL DEFAULT 'ALUNO',
  ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
  data_cadastro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 2. LOCAIS ----------
CREATE TABLE locais (
  id        BIGSERIAL PRIMARY KEY,
  nome      VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  ativo     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- 3. CATEGORIAS ----------
CREATE TABLE categorias (
  id    BIGSERIAL PRIMARY KEY,
  nome  VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- 4. ITENS ----------
CREATE TABLE itens (
  id               BIGSERIAL PRIMARY KEY,
  titulo           VARCHAR(255) NOT NULL,
  descricao        VARCHAR(300) NOT NULL CHECK (char_length(btrim(descricao)) > 0),
  tipo             tipo_item    NOT NULL,
  status           status_item  NOT NULL DEFAULT 'ABERTO',
  data_ocorrencia  DATE         NOT NULL DEFAULT CURRENT_DATE,
  data_publicacao  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em        TIMESTAMP,
  local_guarda     VARCHAR(255),
  usuario_id       BIGINT NOT NULL,
  categoria_id     BIGINT NOT NULL,
  local_id         BIGINT NOT NULL,
  CONSTRAINT fk_item_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
  CONSTRAINT fk_item_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT fk_item_local     FOREIGN KEY (local_id)     REFERENCES locais(id)
);

-- ---------- 5. FOTOS (1 a 3 por item, no Supabase Storage) ----------
CREATE TABLE fotos_item (
  id      BIGSERIAL PRIMARY KEY,
  url     VARCHAR(500) NOT NULL,
  ordem   SMALLINT NOT NULL DEFAULT 1 CHECK (ordem BETWEEN 1 AND 3),
  item_id BIGINT NOT NULL,
  CONSTRAINT fk_foto_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE,
  -- DEFERRABLE: permite renumerar/substituir fotos na mesma transação sem violar a unicidade
  CONSTRAINT uq_foto_item_ordem UNIQUE (item_id, ordem) DEFERRABLE INITIALLY DEFERRED
);

-- ---------- 6. REIVINDICACOES ----------
CREATE TABLE reivindicacoes (
  id                 BIGSERIAL PRIMARY KEY,
  item_id            BIGINT NOT NULL,
  reivindicante_id   BIGINT NOT NULL,
  justificativa      TEXT NOT NULL,
  status             status_reivindicacao NOT NULL DEFAULT 'PENDENTE',
  data_criacao       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_resposta      TIMESTAMP,
  CONSTRAINT fk_reiv_item  FOREIGN KEY (item_id)          REFERENCES itens(id) ON DELETE CASCADE,
  CONSTRAINT fk_reiv_user  FOREIGN KEY (reivindicante_id) REFERENCES usuarios(id),
  CONSTRAINT uq_reiv_item_user UNIQUE (item_id, reivindicante_id)
);
CREATE UNIQUE INDEX uq_reiv_aceita_por_item ON reivindicacoes(item_id) WHERE status = 'ACEITA';

-- ---------- 7. DEVOLUCOES ----------
CREATE TABLE devolucoes (
  id               BIGSERIAL PRIMARY KEY,
  item_id          BIGINT NOT NULL UNIQUE,
  reivindicacao_id BIGINT NOT NULL UNIQUE,
  confirmado_por   BIGINT NOT NULL,
  data_devolucao   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacao       TEXT,
  CONSTRAINT fk_dev_item  FOREIGN KEY (item_id)          REFERENCES itens(id),
  CONSTRAINT fk_dev_reiv  FOREIGN KEY (reivindicacao_id) REFERENCES reivindicacoes(id),
  CONSTRAINT fk_dev_conf  FOREIGN KEY (confirmado_por)   REFERENCES usuarios(id)
);

-- ---------- 8. CONVERSAS + MENSAGENS ----------
CREATE TABLE conversas (
  id              BIGSERIAL PRIMARY KEY,
  item_id         BIGINT NOT NULL,
  dono_item_id    BIGINT NOT NULL,
  interessado_id  BIGINT NOT NULL,
  data_criacao    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conv_item  FOREIGN KEY (item_id)        REFERENCES itens(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_dono  FOREIGN KEY (dono_item_id)   REFERENCES usuarios(id),
  CONSTRAINT fk_conv_int   FOREIGN KEY (interessado_id) REFERENCES usuarios(id),
  CONSTRAINT ck_conv_distintos CHECK (dono_item_id <> interessado_id),
  CONSTRAINT uq_conv UNIQUE (item_id, interessado_id)
);

CREATE TABLE mensagens (
  id            BIGSERIAL PRIMARY KEY,
  conversa_id   BIGINT NOT NULL,
  remetente_id  BIGINT NOT NULL,
  conteudo      TEXT NOT NULL CHECK (char_length(btrim(conteudo)) > 0),
  data_envio    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lida          BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_msg_conversa  FOREIGN KEY (conversa_id)  REFERENCES conversas(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_remetente FOREIGN KEY (remetente_id) REFERENCES usuarios(id)
);

-- ---------- 9. MEDIACOES ----------
CREATE TABLE mediacoes (
  id                   BIGSERIAL PRIMARY KEY,
  motivo               TEXT NOT NULL,
  status               status_mediacao NOT NULL DEFAULT 'PENDENTE',
  data_solicitacao     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_resolucao       TIMESTAMP,
  parecer              TEXT,
  item_id              BIGINT NOT NULL,
  solicitante_id       BIGINT NOT NULL,
  admin_responsavel_id BIGINT,
  CONSTRAINT fk_med_item  FOREIGN KEY (item_id)              REFERENCES itens(id),
  CONSTRAINT fk_med_solic FOREIGN KEY (solicitante_id)       REFERENCES usuarios(id),
  CONSTRAINT fk_med_admin FOREIGN KEY (admin_responsavel_id) REFERENCES usuarios(id),
  CONSTRAINT ck_med_resolucao CHECK (
    status <> 'RESOLVIDO' OR (data_resolucao IS NOT NULL AND parecer IS NOT NULL)
  )
);
CREATE UNIQUE INDEX uq_mediacao_aberta_por_item ON mediacoes(item_id) WHERE status <> 'RESOLVIDO';

-- ---------- 10. DENUNCIAS ----------
CREATE TABLE denuncias (
  id             BIGSERIAL PRIMARY KEY,
  denunciante_id BIGINT NOT NULL REFERENCES usuarios(id),
  item_id        BIGINT REFERENCES itens(id) ON DELETE CASCADE,
  mensagem_id    BIGINT REFERENCES mensagens(id) ON DELETE CASCADE,
  motivo         TEXT NOT NULL,
  resolvida      BOOLEAN NOT NULL DEFAULT FALSE,
  data_criacao   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_denuncia_alvo CHECK (num_nonnulls(item_id, mensagem_id) = 1)
);

-- =====================================================================
-- INDICES
-- =====================================================================
CREATE INDEX idx_itens_usuario      ON itens(usuario_id);
CREATE INDEX idx_itens_categoria    ON itens(categoria_id);
CREATE INDEX idx_itens_local        ON itens(local_id);
CREATE INDEX idx_itens_feed         ON itens(status, tipo, data_publicacao DESC);
CREATE INDEX idx_itens_expiracao    ON itens(expira_em) WHERE status = 'ABERTO';
CREATE INDEX idx_fotos_item         ON fotos_item(item_id);
CREATE INDEX idx_reiv_item          ON reivindicacoes(item_id);
CREATE INDEX idx_reiv_usuario       ON reivindicacoes(reivindicante_id);
CREATE INDEX idx_conv_dono          ON conversas(dono_item_id);
CREATE INDEX idx_conv_interessado   ON conversas(interessado_id);
CREATE INDEX idx_msg_conversa_data  ON mensagens(conversa_id, data_envio);
CREATE INDEX idx_msg_nao_lidas      ON mensagens(conversa_id) WHERE lida = FALSE;
CREATE INDEX idx_med_item           ON mediacoes(item_id);
CREATE INDEX idx_den_resolvida      ON denuncias(resolvida);

-- Busca por termo (usada pela aplicação: lower(col) LIKE '%termo%')
CREATE INDEX idx_itens_titulo_trgm    ON itens USING GIN (lower(titulo)    gin_trgm_ops);
CREATE INDEX idx_itens_descricao_trgm ON itens USING GIN (lower(descricao) gin_trgm_ops);
-- Full-text (português), para evolução futura da busca
CREATE INDEX idx_itens_fts ON itens USING GIN (to_tsvector('portuguese', titulo || ' ' || descricao));
