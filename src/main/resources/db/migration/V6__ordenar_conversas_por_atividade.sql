ALTER TABLE conversas ADD COLUMN ultima_atividade timestamp;

UPDATE conversas c
SET ultima_atividade = GREATEST(
    c.data_criacao,
    COALESCE((SELECT MAX(m.data_envio) FROM mensagens m WHERE m.conversa_id = c.id), c.data_criacao)
);

ALTER TABLE conversas ALTER COLUMN ultima_atividade SET NOT NULL;

CREATE INDEX idx_conversas_ultima_atividade ON conversas (ultima_atividade DESC);
