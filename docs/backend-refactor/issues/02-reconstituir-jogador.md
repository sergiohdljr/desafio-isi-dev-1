# 02: Reconstituir o jogador a partir do banco num lugar só

**What to build:** Cadastro, elenco, compra, venda e escalação continuam devolvendo o mesmo jogador. Uma coluna nova passa a ser lida num único mapeamento.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] O detalhe e a lista de jogadores, o elenco, a compra, a venda e a escalação trazem os mesmos campos de antes.
- [x] A remontagem da linha do banco para o jogador existe uma única vez.

## Comments

A linha do banco vira jogador só em `playerFromRow`.
