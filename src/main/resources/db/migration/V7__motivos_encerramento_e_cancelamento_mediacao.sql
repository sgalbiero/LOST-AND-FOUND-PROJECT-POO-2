ALTER TYPE status_mediacao ADD VALUE IF NOT EXISTS 'CANCELADA';

CREATE TYPE motivo_encerramento_conversa AS ENUM (
  'REIVINDICACAO_RECUSADA',
  'REIVINDICACAO_CANCELADA',
  'OUTRO_REIVINDICANTE_ACEITO',
  'SEM_DEVOLUCAO',
  'ITEM_DEVOLVIDO',
  'ITEM_CANCELADO',
  'ITEM_EXPIRADO'
);

ALTER TABLE conversas
  ADD COLUMN motivo_encerramento motivo_encerramento_conversa;

ALTER TABLE conversas
  DROP CONSTRAINT ck_conv_encerramento_conjunto;

UPDATE conversas
SET motivo_encerramento = 'SEM_DEVOLUCAO'
WHERE data_encerramento IS NOT NULL;

ALTER TABLE conversas
  ADD CONSTRAINT ck_conv_motivo_encerramento CHECK (
    (data_encerramento IS NULL AND motivo_encerramento IS NULL)
    OR (data_encerramento IS NOT NULL AND motivo_encerramento IS NOT NULL)
  );
