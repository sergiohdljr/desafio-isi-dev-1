# 06: Consultar a classificação

**What to build:** Alguém consulta a classificação de todos os clubes, inclusive os que ainda não jogaram. A tabela é calculada na hora: pontos, saldo, gols marcados e nome.

**Blocked by:** 03: Jogar a partida e gravar placar e duelos.

**Status:** resolved

- [x] `GET /api/v1/standings` responde `200` com um array, um item por clube. Cada item traz `position`, `club_id`, `club_name`, `played`, `wins`, `draws`, `losses`, `goals_for`, `goals_against`, `goal_difference` e `points`.
- [x] Vitória vale 3, empate 1 e derrota 0. Clube que não jogou entra zerado.
- [x] A ordem é mais pontos, depois maior saldo, depois mais gols marcados, depois o nome do clube. `position` vai de 1 ao total, sem repetir.
- [x] No exemplo com Águias FC 1 × 2 Delta FC, Gama SC 2 × 1 Épsilon EC, Épsilon EC 3 × 2 Águias FC e Delta FC 0 × 1 Gama SC, e com Mangue FC e Tubarões EC sem jogos, a ordem é Gama SC, Épsilon EC, Delta FC, Mangue FC, Tubarões EC e Águias FC.
- [x] A classificação não fica gravada: uma partida nova muda a consulta seguinte.

## Comments

Implementado: a classificação é calculada na consulta e segue pontos, saldo, gols marcados e nome.
