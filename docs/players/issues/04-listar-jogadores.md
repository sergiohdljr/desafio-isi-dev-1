# 04: Listar jogadores

**What to build:** Alguém lista os jogadores em páginas, busca pelo nome e combina filtros de posição, condição, livre ou com clube, clube, idade e valor de mercado. A ordenação pode ser por nome, valor de mercado, idade ou posição.

**Blocked by:** 01: Cadastrar e consultar um jogador; 02: Alterar a condição física

**Status:** resolved

- [x] `GET /api/v1/players` responde `200` com `data` e `meta` (`page`, `limit`, `total_items`, `total_pages`). Cada item tem os mesmos campos da consulta de um jogador. Sem resultados, `data` é uma lista vazia.
- [x] Os filtros se combinam e todos se aplicam ao mesmo tempo. `search` encontra o texto dentro do nome, sem diferenciar maiúsculas e acentos. `free=true` traz só quem não tem clube; `free=false`, só quem tem. `club_id` traz o elenco daquele clube; clube inexistente responde `404`.
- [x] Faixas de idade e de valor de mercado são inclusivas. Se vier só um dos limites, o outro assume o extremo da faixa. Filtro e ordenação por valor usam o valor de mercado, nunca o valor base.
- [x] `sort` padrão é `name`. Até dois critérios, separados por vírgula, sem espaço e sem repetir o campo; o segundo desempata o primeiro. Depois, o empate se desfaz pelo nome e pelo id crescente. Nome segue a ordem alfabética do enunciado. `position` ordena GOL, ZAG, LAT, MEI, ATA.
- [x] A paginação acontece depois de buscar, filtrar e ordenar. `total_items` conta todos os que atendem aos filtros. `total_pages` é essa conta dividida por `limit`, arredondada para cima, e 0 quando não há itens. Página além da última responde `200` com `data` vazia e o `meta` correto. Padrões: `page` 1 e `limit` 10.
- [x] Parâmetro presente e vazio, valor fora do aceito (inclusive maiúsculas trocadas), inteiro mal formado ou decimal fora de `10`, `10.5` e `10.55` responde `400`. `min_age` maior que `max_age`, `min_value` maior que `max_value`, ou `free=true` junto com `club_id` responde `400`. `free=false` junto com `club_id` é aceito. Nome de parâmetro desconhecido é ignorado.
