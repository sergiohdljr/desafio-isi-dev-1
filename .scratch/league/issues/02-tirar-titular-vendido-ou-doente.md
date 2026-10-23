# 02: Tirar o titular vendido ou que ficou doente

**What to build:** Quando um titular é vendido, ou passa a `DOENTE`, ele sai da escalação na mesma operação. A formação permanece, a escalação fica incompleta e o jogador não volta sozinho se deixar de estar doente.

**Blocked by:** 01: Escalar os cinco titulares e consultar a escalação.

**Status:** resolved

- [x] Vender um titular tira só esse jogador da escalação, na mesma operação da venda. `GET /api/v1/clubs/{id}/lineup` mantém a `formation`, devolve os titulares que sobraram na ordem do elenco e `complete` false.
- [x] Marcar um titular como `DOENTE` tira esse jogador na mesma operação da alteração de condição. A formação e os demais titulares permanecem, e `complete` fica false.
- [x] Se o jogador deixar de estar `DOENTE`, ele não volta para a escalação. Só entra de novo quando o clube escalar outra vez.
- [x] Uma escalação que já estava incompleta não é refeita por essas operações, e o caixa continua mudando só pelo que a venda já fazia.

## Comments

Implementado: a venda e a mudança para doente tiram o titular na mesma operação, e ele não volta sozinho.
