# 04: Um único limite para id positivo

**What to build:** Id de URL inválido continua `404` e id inválido no corpo continua `400`, com o mesmo teto `2147483647`. O teto e o formato da URL ficam definidos uma vez.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Id de URL como `abc`, `0`, `01` ou acima de `2147483647` responde `404` em jogador, clube, escalação e partida.
- [x] Id inválido no corpo da compra, da escalação e da partida responde `400`.
- [x] O teto inteiro e o schema de id da URL existem uma única vez.

## Comments

O teto e o schema de id da URL ficam em `resourceId`. O corpo continua com inteiro JSON.
