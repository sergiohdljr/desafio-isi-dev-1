CREATE INDEX "jogadores_clube_ativo_idx"
  ON "jogadores" ("clube_id")
  WHERE "excluido_em" IS NULL;
DROP INDEX "jogadores_clube_id_idx";

CREATE INDEX "transacoes_clube_id_criado_em_id_idx"
  ON "transacoes" ("clube_id", "criado_em" DESC, "id" DESC);
DROP INDEX "transacoes_clube_id_idx";

CREATE INDEX "contratos_jogador_id_clube_id_situacao_iniciado_em_idx"
  ON "contratos" ("jogador_id", "clube_id", "situacao", "iniciado_em" DESC);
DROP INDEX "contratos_jogador_id_idx";

CREATE INDEX "partidas_jogada_em_id_idx"
  ON "partidas" ("jogada_em" DESC, "id" DESC);
