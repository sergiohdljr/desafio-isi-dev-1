ALTER TABLE "clubes" ADD COLUMN "nome_chave" VARCHAR(60)
  GENERATED ALWAYS AS (lower("nome")) STORED;

CREATE UNIQUE INDEX "clubes_nome_chave_key" ON "clubes"("nome_chave");
