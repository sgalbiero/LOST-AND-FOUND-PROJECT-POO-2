DROP INDEX IF EXISTS uq_mediacao_aberta_por_item;

UPDATE mediacoes
SET status = 'CANCELADA', data_resolucao = CURRENT_TIMESTAMP
WHERE conversa_id IS NULL AND status IN ('PENDENTE', 'EM_ANDAMENTO');

CREATE UNIQUE INDEX uq_mediacao_aberta_por_conversa
  ON mediacoes(conversa_id)
  WHERE conversa_id IS NOT NULL AND status IN ('PENDENTE', 'EM_ANDAMENTO');
