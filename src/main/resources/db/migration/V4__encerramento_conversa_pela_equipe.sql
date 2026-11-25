ALTER TABLE conversas
  ADD COLUMN encerrada_pela_equipe BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE conversas
  DROP CONSTRAINT ck_conv_encerramento_conjunto;

ALTER TABLE conversas
  ADD CONSTRAINT ck_conv_encerramento_conjunto CHECK (
    data_encerramento IS NULL
    OR encerrada_pela_equipe
    OR (encerramento_dono_solicitado AND encerramento_interessado_solicitado)
  ),
  ADD CONSTRAINT ck_conv_encerramento_equipe_data CHECK (
    NOT encerrada_pela_equipe OR data_encerramento IS NOT NULL
  );
