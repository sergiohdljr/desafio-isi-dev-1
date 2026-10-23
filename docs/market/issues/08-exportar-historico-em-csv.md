# 08: Exportar o histórico em CSV

**What to build:** Alguém baixa o histórico do clube em CSV, com os mesmos filtros da consulta. Os erros continuam em JSON. O arquivo traz o nome gravado na transação, na mesma ordem do histórico.

**Blocked by:** 07: Filtrar o histórico por tipo e jogador.

**Status:** resolved

- [x] `GET /api/v1/clubs/{id}/transactions/export` aceita `type` e `player_id` com as mesmas validações da consulta. Sucesso responde `200` com `Content-Type: text/csv`. O corpo é UTF-8, sem BOM, e cada linha termina em `\n`, inclusive a última.
- [x] A primeira linha é `data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa`. Cada transação filtrada vira uma linha, da mais recente para a mais antiga, com o mesmo desempate do histórico. `data_hora` sai como `AAAA-MM-DDTHH:MM:SS-03:00`. Valores têm 2 casas e vírgula decimal; negativo começa com `-`. Lucro vazio quando nulo. O separador é `;`.
- [x] O jogador é o nome gravado na transação. Se o nome tiver `;` ou aspas, o campo vai entre aspas duplas e cada aspa interna é duplicada, como `"Zé ""Foguete"" Lima"`.
- [x] Sem transações, a resposta traz só a linha de cabeçalho, ainda com `\n` no fim. `Content-Disposition` é opcional.
- [x] Filtro inválido responde `400` em JSON, com `message` não vazio. Clube inexistente, ou jogador do filtro inexistente ou excluído, responde `404` em JSON. Esses erros não vêm como CSV.

## Comments

Implementado: a exportação repete os filtros do histórico, em CSV com vírgula decimal, aspas quando o nome pede, e erro ainda em JSON.
