-- Datas como instante, não como parede. Os valores atuais foram gravados em UTC
-- pelo Prisma, então a conversão preserva o instante.
ALTER TABLE "jogadores"
  ALTER COLUMN "excluido_em" TYPE TIMESTAMPTZ(6) USING "excluido_em" AT TIME ZONE 'UTC',
  ALTER COLUMN "criado_em" TYPE TIMESTAMPTZ(6) USING "criado_em" AT TIME ZONE 'UTC',
  ALTER COLUMN "atualizado_em" TYPE TIMESTAMPTZ(6) USING "atualizado_em" AT TIME ZONE 'UTC';

ALTER TABLE "clubes"
  ALTER COLUMN "criado_em" TYPE TIMESTAMPTZ(6) USING "criado_em" AT TIME ZONE 'UTC';

ALTER TABLE "contratos"
  ALTER COLUMN "fidelidade_ate" TYPE TIMESTAMPTZ(6) USING "fidelidade_ate" AT TIME ZONE 'UTC',
  ALTER COLUMN "iniciado_em" TYPE TIMESTAMPTZ(6) USING "iniciado_em" AT TIME ZONE 'UTC',
  ALTER COLUMN "encerrado_em" TYPE TIMESTAMPTZ(6) USING "encerrado_em" AT TIME ZONE 'UTC';

ALTER TABLE "transacoes"
  ALTER COLUMN "criado_em" TYPE TIMESTAMPTZ(6) USING "criado_em" AT TIME ZONE 'UTC';

ALTER TABLE "escalacoes"
  ALTER COLUMN "criado_em" TYPE TIMESTAMPTZ(6) USING "criado_em" AT TIME ZONE 'UTC';

ALTER TABLE "partidas"
  ALTER COLUMN "jogada_em" TYPE TIMESTAMPTZ(6) USING "jogada_em" AT TIME ZONE 'UTC';

-- CHAR(3) obrigava trim na leitura.
ALTER TABLE "clubes" ALTER COLUMN "sigla" TYPE VARCHAR(3);

-- Atributos de 0 a 100 não precisam de 4 bytes.
ALTER TABLE "jogadores"
  ALTER COLUMN "agilidade" TYPE SMALLINT,
  ALTER COLUMN "idade" TYPE SMALLINT,
  ALTER COLUMN "velocidade" TYPE SMALLINT,
  ALTER COLUMN "finalizacao" TYPE SMALLINT,
  ALTER COLUMN "passe" TYPE SMALLINT,
  ALTER COLUMN "drible" TYPE SMALLINT,
  ALTER COLUMN "defesa" TYPE SMALLINT,
  ALTER COLUMN "fisico" TYPE SMALLINT,
  ALTER COLUMN "potencial" TYPE SMALLINT;

-- Invariantes que até aqui só a aplicação garantia. Os limites são os mesmos
-- do schema de entrada: indicadores 1 a 99, agilidade 1 a 100, idade 16 a 45.
ALTER TABLE "jogadores"
  ADD CONSTRAINT "jogadores_indicadores_check" CHECK (
    "velocidade" BETWEEN 1 AND 99 AND
    "finalizacao" BETWEEN 1 AND 99 AND
    "passe" BETWEEN 1 AND 99 AND
    "drible" BETWEEN 1 AND 99 AND
    "defesa" BETWEEN 1 AND 99 AND
    "fisico" BETWEEN 1 AND 99 AND
    "potencial" BETWEEN 1 AND 99
  ),
  ADD CONSTRAINT "jogadores_agilidade_check" CHECK ("agilidade" BETWEEN 1 AND 100),
  ADD CONSTRAINT "jogadores_idade_check" CHECK ("idade" BETWEEN 16 AND 45),
  ADD CONSTRAINT "jogadores_valor_base_check" CHECK ("valor_base" > 0);

ALTER TABLE "clubes"
  ADD CONSTRAINT "clubes_caixa_check" CHECK ("caixa" >= 0);

ALTER TABLE "partidas"
  ADD CONSTRAINT "partidas_gols_check" CHECK ("gols_mandante" >= 0 AND "gols_visitante" >= 0),
  ADD CONSTRAINT "partidas_adversarios_check" CHECK ("mandante_id" <> "visitante_id");

ALTER TABLE "transacoes"
  ADD CONSTRAINT "transacoes_valores_check" CHECK (
    "valor" >= 0 AND "taxa" >= 0 AND "multa" >= 0
  );

-- Era a única FK com SET NULL; clube não é removido, então RESTRICT alinha com as demais.
ALTER TABLE "jogadores" DROP CONSTRAINT "jogadores_clube_id_fkey";
ALTER TABLE "jogadores" ADD CONSTRAINT "jogadores_clube_id_fkey"
  FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
