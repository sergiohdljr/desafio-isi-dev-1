# 05: Recusar a recompra pelo clube que vendeu

**What to build:** O clube que vendeu um jogador não pode comprá-lo de novo. Outro clube pode. A tentativa recusada não grava nada.

**Blocked by:** 03: Vender um jogador com a fidelidade cumprida.

**Status:** resolved

- [x] Depois da venda, o mesmo clube que vendeu recebe `409` com `message` não vazio ao tentar comprar esse jogador. Não grava transação nem contrato, e não muda caixa, elenco nem o fato de o jogador estar livre.
- [x] Outro clube compra esse jogador com sucesso, pelo valor de mercado do momento, com taxa, contrato ativo e transação de compra.
- [x] A proibição é só do clube que já o vendeu. Um terceiro clube, que nunca o vendeu, também pode comprá-lo quando ele estiver livre.

## Comments

Implementado: o clube que vendeu recebe 409 na recompra, e outro clube consegue comprar o jogador livre.
