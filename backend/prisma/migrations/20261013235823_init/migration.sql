
CREATE TYPE "posicao" AS ENUM ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA');

CREATE TYPE "condicao" AS ENUM ('APTO', 'MAL_CONDICIONADO', 'DOENTE');

CREATE TYPE "condicao_duelo" AS ENUM ('APTO', 'MAL_CONDICIONADO');

CREATE TYPE "situacao_contrato" AS ENUM ('ATIVO', 'ENCERRADO', 'RESCINDIDO');

CREATE TYPE "tipo_transacao" AS ENUM ('COMPRA', 'VENDA');

CREATE TYPE "formacao" AS ENUM ('3-1', '2-2', '2-1-1', '1-2-1');

CREATE TYPE "atributo_duelo" AS ENUM ('shooting', 'passing', 'dribbling', 'defending');

CREATE TABLE "jogadores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "posicao" "posicao" NOT NULL,
    "agilidade" INTEGER NOT NULL,
    "idade" INTEGER NOT NULL,
    "valor_base" DECIMAL(6,2) NOT NULL,
    "condicao" "condicao" NOT NULL,
    "clube_id" INTEGER,
    "velocidade" INTEGER NOT NULL,
    "finalizacao" INTEGER NOT NULL,
    "passe" INTEGER NOT NULL,
    "drible" INTEGER NOT NULL,
    "defesa" INTEGER NOT NULL,
    "fisico" INTEGER NOT NULL,
    "potencial" INTEGER NOT NULL,
    "excluido_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "jogadores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clubes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "sigla" CHAR(3) NOT NULL,
    "caixa" DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    "formacao" "formacao",
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contratos" (
    "id" SERIAL NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "valor_compra" DECIMAL(6,2) NOT NULL,
    "fidelidade_ate" TIMESTAMP(6) NOT NULL,
    "situacao" "situacao_contrato" NOT NULL,
    "iniciado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerrado_em" TIMESTAMP(6),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transacoes" (
    "id" SERIAL NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "nome_jogador" VARCHAR(100) NOT NULL,
    "tipo" "tipo_transacao" NOT NULL,
    "valor" DECIMAL(6,2) NOT NULL,
    "taxa" DECIMAL(6,2) NOT NULL,
    "multa" DECIMAL(6,2) NOT NULL,
    "lucro" DECIMAL(7,2),
    "variacao_caixa" DECIMAL(8,2) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "escalacoes" (
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalacoes_pkey" PRIMARY KEY ("clube_id","jogador_id")
);

CREATE TABLE "partidas" (
    "id" SERIAL NOT NULL,
    "mandante_id" INTEGER NOT NULL,
    "visitante_id" INTEGER NOT NULL,
    "gols_mandante" INTEGER NOT NULL,
    "gols_visitante" INTEGER NOT NULL,
    "formacao_mandante" "formacao" NOT NULL,
    "formacao_visitante" "formacao" NOT NULL,
    "jogada_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "duelos_partida" (
    "id" SERIAL NOT NULL,
    "partida_id" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "clube_atacante_id" INTEGER NOT NULL,
    "atacante_id" INTEGER NOT NULL,
    "defensor_id" INTEGER NOT NULL,
    "nome_atacante" VARCHAR(100) NOT NULL,
    "nome_defensor" VARCHAR(100) NOT NULL,
    "posicao_atacante" "posicao" NOT NULL,
    "posicao_defensor" "posicao" NOT NULL,
    "condicao_atacante" "condicao_duelo" NOT NULL,
    "condicao_defensor" "condicao_duelo" NOT NULL,
    "atributo_ataque" "atributo_duelo" NOT NULL,
    "atributo_defesa" "atributo_duelo" NOT NULL,
    "valor_ataque" INTEGER NOT NULL,
    "valor_defesa" INTEGER NOT NULL,
    "gol" BOOLEAN NOT NULL,

    CONSTRAINT "duelos_partida_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "jogadores_clube_id_idx" ON "jogadores"("clube_id");
CREATE UNIQUE INDEX "clubes_nome_key" ON "clubes"("nome");
CREATE UNIQUE INDEX "clubes_sigla_key" ON "clubes"("sigla");
CREATE INDEX "contratos_jogador_id_idx" ON "contratos"("jogador_id");
CREATE INDEX "contratos_clube_id_idx" ON "contratos"("clube_id");
CREATE INDEX "transacoes_clube_id_idx" ON "transacoes"("clube_id");
CREATE INDEX "transacoes_jogador_id_idx" ON "transacoes"("jogador_id");
CREATE UNIQUE INDEX "escalacoes_jogador_id_key" ON "escalacoes"("jogador_id");
CREATE INDEX "partidas_mandante_id_idx" ON "partidas"("mandante_id");
CREATE INDEX "partidas_visitante_id_idx" ON "partidas"("visitante_id");
CREATE INDEX "duelos_partida_clube_atacante_id_idx" ON "duelos_partida"("clube_atacante_id");
CREATE INDEX "duelos_partida_atacante_id_idx" ON "duelos_partida"("atacante_id");
CREATE INDEX "duelos_partida_defensor_id_idx" ON "duelos_partida"("defensor_id");
CREATE UNIQUE INDEX "duelos_partida_partida_id_ordem_key" ON "duelos_partida"("partida_id", "ordem");
ALTER TABLE "jogadores" ADD CONSTRAINT "jogadores_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_mandante_id_fkey" FOREIGN KEY ("mandante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_clube_atacante_id_fkey" FOREIGN KEY ("clube_atacante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_atacante_id_fkey" FOREIGN KEY ("atacante_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_defensor_id_fkey" FOREIGN KEY ("defensor_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
