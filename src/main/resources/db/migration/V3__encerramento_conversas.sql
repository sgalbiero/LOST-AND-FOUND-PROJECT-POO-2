ALTER TABLE conversas
  ADD COLUMN encerramento_dono_solicitado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN encerramento_interessado_solicitado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN data_encerramento TIMESTAMP;

ALTER TABLE conversas
  ADD CONSTRAINT ck_conv_encerramento_conjunto CHECK (
    data_encerramento IS NULL
    OR (encerramento_dono_solicitado AND encerramento_interessado_solicitado)
  );
