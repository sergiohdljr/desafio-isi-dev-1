# 07: Filtrar o histórico por tipo e jogador

**What to build:** A consulta do histórico aceita filtro por um ou mais tipos e por jogador. O resumo acompanha o que passou no filtro. Filtro inválido é recusado. Jogador inexistente também. Jogador que existe, mas não tem transação naquele clube, devolve lista vazia.

**Blocked by:** 06: Consultar o histórico do clube.

**Status:** resolved

- [x] `type` aceita um ou mais de `COMPRA` e `VENDA`, separados por vírgula, sem espaço e sem repetir. `player_id` aceita o id de um jogador existente. Os dois se combinam: o resultado atende aos dois. Ausente não filtra.
- [x] O `summary` usa só as transações filtradas. Com `type=VENDA`, `total_spent` é 0,00. Com `type=COMPRA`, `total_received`, `total_penalties` e `total_profit` são 0,00. `type=COMPRA,VENDA` traz os dois tipos.
- [x] Jogador existente sem transações naquele clube responde `200`, com `data` vazio e os cinco totais em 0,00.
- [x] `type` vazio, fora da lista, com espaço, com repetição ou com maiúsculas trocadas (`venda`) responde `400` com corpo JSON e `message` não vazio. `player_id` que não é inteiro positivo só com dígitos, no mesmo critério dos outros ids, responde `400`. Nada é gravado.
- [x] `player_id` de jogador inexistente ou excluído responde `404`. Clube inexistente responde `404`. Nome de parâmetro desconhecido é ignorado.

## Comments

Implementado: o filtro por tipo e jogador restringe a lista e o resumo. Filtro inválido responde 400 e jogador inexistente responde 404.
