# 02: Recusar compra fora do elenco ou do caixa

**What to build:** A compra que viola elenco ou caixa é recusada e não deixa rastro. O jogador precisa estar livre. O clube aceita no máximo 12 jogadores. O custo total não pode passar da metade exata do caixa de antes da compra, e o caixa não fica negativo.

**Blocked by:** 01: Comprar um jogador livre.

**Status:** resolved

- [x] Comprar um jogador que já está em algum clube responde `409` com `message` não vazio, sem stack trace. Não grava transação nem contrato, e não muda caixa, elenco nem clube do jogador.
- [x] O 12º jogador do clube é aceito. O 13º responde `409` e não grava.
- [x] O limite é a metade do caixa antes da compra, sem arredondar essa metade. Com caixa 100,00, mercado 48,00 gera taxa 2,40 e custo 50,40, acima de 50,00, e a compra responde `409`. Com caixa 261,15, o limite é 130,575, e um custo de 130,58 responde `409`. O caixa permanece o de antes.
- [x] Cada recusa desfaz a operação por inteiro: o jogador continua como estava, o elenco não cresce e nenhuma transação nova aparece no histórico.

## Comments

Implementado: jogador ocupado, 13º do elenco e custo acima da metade exata do caixa respondem 409 sem gravar.
