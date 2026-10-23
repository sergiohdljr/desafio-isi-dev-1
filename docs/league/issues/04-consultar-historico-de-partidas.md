# 04: Consultar o histórico de partidas

**What to build:** Alguém lista as partidas da mais recente para a mais antiga, com placar e resultado, sem os duelos. Pode restringir às partidas de um clube, como mandante ou visitante.

**Blocked by:** 03: Jogar a partida e gravar placar e duelos.

**Status:** resolved

- [x] `GET /api/v1/matches` responde `200` com um array. Cada item traz `id`, `played_at`, `home`, `away` e `result`, e não traz `duels`. Sem partidas, a lista vem vazia.
- [x] A ordem é da mais recente para a mais antiga. No mesmo instante, o maior `id` vem primeiro.
- [x] `club_id` opcional devolve só as partidas em que o clube foi mandante ou visitante. Clube inexistente responde `404` com `message` não vazio. `club_id` vazio, malformado ou fora do formato de inteiro positivo responde `400`.
- [x] `played_at` sai como `AAAA-MM-DDTHH:MM:SS-03:00`.

## Comments

Implementado: o histórico sai da mais recente para a mais antiga, sem os duelos, com filtro por clube.
