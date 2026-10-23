# 03: Jogar a partida e gravar placar e duelos

**What to build:** Alguém joga uma partida entre dois clubes com escalação completa. A API calcula o placar na hora, sempre o mesmo para os mesmos titulares e condições, e grava a partida com as formações e os seis duelos. Caixa, escalação e jogadores não mudam.

**Blocked by:** 01: Escalar os cinco titulares e consultar a escalação. 02: Tirar o titular vendido ou que ficou doente.

**Status:** resolved

- [x] `POST /api/v1/matches` com `home_club_id` e `away_club_id` responde `201`, `Content-Type: application/json` e `Location: /api/v1/matches/{id}`. A resposta traz `id`, `played_at`, `home` e `away` (`club_id`, `club_name`, `formation`, `goals`), `result` e `duels`.
- [x] São sempre 6 duelos. Nos 1 a 3 ataca o mandante; nos 4 a 6, o visitante. O 4º jogador de linha enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º. A ordem dos jogadores de linha é a do elenco, do mais recuado ao mais avançado; na mesma posição, nome e depois id.
- [x] ATA usa finalização, MEI usa passe, ZAG e LAT usam drible. O defensor usa defesa. `MAL_CONDICIONADO` joga com 15% a menos, arredondado ao inteiro mais próximo, com o meio para cima (74 × 0,85 = 63; 50 × 0,85 = 43). Gol só quando o ataque é maior que a defesa. `result` é `MANDANTE`, `VISITANTE` ou `EMPATE`.
- [x] No exemplo Águias FC × Delta FC, os dois no `2-1-1`, com o lateral do Águias `MAL_CONDICIONADO`, o placar é 1 × 2 e `result` é `VISITANTE`. Os duelos batem com a tabela da RN20, inclusive o duelo empatado em 63 que não é gol.
- [x] Corpo inválido, id inválido ou os dois clubes iguais respondem `400` com `message` não vazio e não gravam. Clube inexistente responde `404`. Clube sem escalação, ou com escalação incompleta depois de venda ou de `DOENTE`, responde `409`.
- [x] A partida não muda o caixa, a escalação nem os atributos e a condição dos jogadores. O mesmo confronto pode ser jogado de novo.

## Comments

Implementado: a partida grava placar e duelos na hora. Águias 1 × 2 Delta, com o duelo empatado sem gol.
