ALTER TABLE mediacoes ADD COLUMN conversa_id BIGINT;

UPDATE mediacoes m
SET conversa_id = (
  SELECT c.id
  FROM conversas c
  WHERE c.item_id = m.item_id
    AND (c.dono_item_id = m.solicitante_id OR c.interessado_id = m.solicitante_id)
  ORDER BY c.data_criacao DESC
  LIMIT 1
);

ALTER TABLE mediacoes
  ADD CONSTRAINT fk_med_conversa
  FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE SET NULL;

CREATE INDEX idx_med_conversa ON mediacoes(conversa_id);
