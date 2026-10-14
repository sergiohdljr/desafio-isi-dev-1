# Liga

Escalação, partida e classificação. O clube nasce sem escalação. A partida é determinística: os mesmos titulares, nas mesmas condições, produzem o mesmo placar. A classificação é calculada em cada consulta.

## Escalação (RN19)

`PUT /api/v1/clubs/{id}/lineup` recebe `formation` e `player_ids` (5 ids, qualquer ordem) e substitui a escalação inteira. Sempre 1 GOL e 4 jogadores de linha. Formações, sem contar o goleiro:

| `formation` | Defesa (ZAG ou LAT) | Meio (MEI) | Ataque (ATA) |
| --- | --- | --- | --- |
| `3-1` | 3 | 0 | 1 |
| `2-2` | 2 | 0 | 2 |
| `2-1-1` | 2 | 1 | 1 |
| `1-2-1` | 1 | 2 | 1 |

Cada titular é do elenco e não está `DOENTE`. `MAL_CONDICIONADO` pode ser escalado. Fora disso, `409` e nada é gravado. Formação ou lista inválida, `400`. Clube ou jogador inexistente, `404`. Escalar não muda o caixa.

`GET /api/v1/clubs/{id}/lineup` devolve `club_id`, `formation`, `complete` e `players` na ordem do elenco, com os campos de `GET /players/{id}`. Sem escalação: `formation` null, `players` vazio, `complete` false. Incompleta: a formação permanece, `players` traz quem sobrou, `complete` false.

O titular sai na mesma operação da venda ou da mudança para `DOENTE`. Se deixar de estar doente, não volta sozinho.

## Partida (RN20)

`POST /api/v1/matches` recebe `home_club_id` e `away_club_id`, joga na hora e grava placar, formações e 6 duelos. `201` e `Location`. Corpo ou ids inválidos, ou mandante igual ao visitante, `400`. Clube inexistente, `404`. Escalação ausente ou incompleta, `409`.

Os jogadores de linha são numerados pela ordem do elenco, do 1º ao 4º. Duelos 1–3 são ataques do mandante; 4–6, do visitante. O 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º. ATA usa finalização, MEI usa passe, ZAG e LAT usam drible. O defensor usa defesa. `MAL_CONDICIONADO` joga com o atributo × 0,85, arredondado ao inteiro mais próximo, meio para cima. Gol quando o ataque é maior que a defesa. `result` é `MANDANTE`, `VISITANTE` ou `EMPATE`.

A partida não muda caixa, escalação nem jogadores. O que foi gravado não muda se o jogador for editado, vendido ou mudar de condição depois.

## Histórico e classificação (RN21)

`GET /api/v1/matches` lista da mais recente para a mais antiga (no mesmo instante, maior id primeiro), sem `duels`. `club_id` filtra mandante ou visitante.

`GET /api/v1/matches/{id}` devolve a partida com os 6 duelos.

`GET /api/v1/standings` devolve todos os clubes, inclusive os que não jogaram. Ordem: pontos, saldo de gols, gols marcados, nome. `position` de 1 ao total, sem repetir. Vitória 3, empate 1, derrota 0. Não fica gravada.
