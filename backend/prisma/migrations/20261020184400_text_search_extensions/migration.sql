-- Em migration separada: o dicionário do unaccent só fica visível para índices de
-- expressão depois que a transação que cria a extensão é confirmada.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
