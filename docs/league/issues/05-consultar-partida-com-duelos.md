# 05: Consultar uma partida com os seis duelos

**What to build:** Alguém abre uma partida e vê os seis duelos como foram jogados. Editar, vender ou mudar a condição de um jogador depois não altera essa partida.

**Blocked by:** 03: Jogar a partida e gravar placar e duelos.

**Status:** resolved

- [x] `GET /api/v1/matches/{id}` responde `200` com a partida e `duels` na ordem 1 a 6. Cada duelo traz `order`, `attacking_club_id`, `goal`, e atacante e defensor com `player_id`, `player_name`, `position`, `condition`, `attribute` e `value`.
- [x] Os nomes, posições, condições, atributos e valores são os gravados na partida. Mudar o atributo, vender ou alterar a condição do jogador depois não muda a consulta.
- [x] Partida inexistente, ou id inválido na URL, responde `404` com `message` não vazio.

## Comments

Implementado: o detalhe devolve os seis duelos gravados, e uma mudança posterior no jogador não os altera.
