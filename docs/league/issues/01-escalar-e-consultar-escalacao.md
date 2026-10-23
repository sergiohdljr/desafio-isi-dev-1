# 01: Escalar os cinco titulares e consultar a escalação

**What to build:** Alguém escolhe a formação e os cinco titulares de um clube, e consegue consultar essa escalação. O clube nasce sem escalação. A operação substitui a escalação inteira e não mexe no caixa.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `GET /api/v1/clubs/{id}/lineup` de um clube que nunca escalou responde `200` com `club_id`, `formation` null, `players` vazio e `complete` false.
- [x] `PUT /api/v1/clubs/{id}/lineup` com `formation` (`3-1`, `2-2`, `2-1-1` ou `1-2-1`) e `player_ids` com 5 ids, em qualquer ordem, responde `200` e substitui a escalação inteira. A consulta devolve `complete` true e os cinco jogadores na ordem do elenco, cada um com os campos de `GET /players/{id}`.
- [x] A escalação fecha com exatamente 1 GOL e os setores da formação: defesa (ZAG ou LAT), meio (MEI) e ataque (ATA). Jogador `MAL_CONDICIONADO` pode ser escalado.
- [x] Formação ausente ou inválida, `player_ids` ausente, que não é lista, com tamanho diferente de 5, com ids repetidos ou que não são inteiros positivos, responde `400` com `message` não vazio e não grava.
- [x] Clube ou jogador inexistente, ou id de clube inválido na URL, responde `404` com `message` não vazio e não grava. Jogador fora do elenco, `DOENTE`, ou posições que não fecham a formação, responde `409` e não grava.
- [x] Campo desconhecido no corpo é ignorado. O caixa do clube permanece o mesmo.

## Comments

Implementado: a escalação substitui os cinco titulares e a consulta devolve a ordem do elenco, sem mexer no caixa.
