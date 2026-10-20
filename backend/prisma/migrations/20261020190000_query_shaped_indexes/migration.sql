-- Os índices de coluna única não cobrem o soft delete nem a ordenação das listagens.
-- Estes espelham os predicados reais, e os substituídos são prefixo dos novos.

-- Contagem de elenco em readPurchase. Toda consulta por clube filtra o soft delete,
-- então o índice parcial substitui o índice cheio.
CREATE INDEX "jogadores_clube_ativo_idx"
  ON "jogadores" ("clube_id")
  WHERE "excluido_em" IS NULL;
DROP INDEX "jogadores_clube_id_idx";

-- Histórico de transações do clube, que ordena por criado_em desc, id desc.
CREATE INDEX "transacoes_clube_id_criado_em_id_idx"
  ON "transacoes" ("clube_id", "criado_em" DESC, "id" DESC);
DROP INDEX "transacoes_clube_id_idx";

-- Contrato ativo mais recente do jogador no clube, em readSale.
CREATE INDEX "contratos_jogador_id_clube_id_situacao_iniciado_em_idx"
  ON "contratos" ("jogador_id", "clube_id", "situacao", "iniciado_em" DESC);
DROP INDEX "contratos_jogador_id_idx";

-- Listagem de partidas, que ordena por jogada_em desc, id desc.
CREATE INDEX "partidas_jogada_em_id_idx"
  ON "partidas" ("jogada_em" DESC, "id" DESC);
