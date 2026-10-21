CREATE FUNCTION valor_mercado(
  valor_base numeric,
  condicao condicao,
  agilidade int,
  idade int
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT greatest(
    round(
      valor_base * (
        1000 + greatest(
          CASE
            WHEN idade <= 21 THEN 100
            WHEN idade >= 32 THEN -100
            ELSE 0
          END
          - CASE
              WHEN condicao = 'APTO' THEN 0
              ELSE (CASE WHEN condicao = 'MAL_CONDICIONADO' THEN 150 ELSE 300 END)
                     / (CASE WHEN agilidade >= 80 THEN 2 ELSE 1 END)
                   + (CASE WHEN agilidade <= 30 THEN 100 ELSE 0 END)
            END,
          -400
        )
      ) / 1000,
      2
    ),
    1.00
  );
$$;

CREATE INDEX "jogadores_valor_mercado_idx"
  ON "jogadores" (valor_mercado("valor_base", "condicao", "agilidade", "idade"), "id")
  WHERE "excluido_em" IS NULL;

CREATE FUNCTION nome_dobrado(valor text) RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT lower(public.unaccent('public.unaccent'::regdictionary, valor));
$$;

CREATE INDEX "jogadores_nome_trgm_idx"
  ON "jogadores" USING gin (nome_dobrado("nome") gin_trgm_ops)
  WHERE "excluido_em" IS NULL;

CREATE INDEX "jogadores_nome_ordem_idx"
  ON "jogadores" (nome_dobrado("nome") COLLATE "C", "id")
  WHERE "excluido_em" IS NULL;
