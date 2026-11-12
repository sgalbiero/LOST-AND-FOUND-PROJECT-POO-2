INSERT INTO categorias (nome) VALUES
  ('Documentos'), ('Eletrônicos'), ('Material escolar'), ('Vestuário'),
  ('Garrafas e lancheiras'), ('Chaves'), ('Acessórios'), ('Outros')
ON CONFLICT (nome) DO NOTHING;
