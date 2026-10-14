# 07: Compra e venda continuam atômicas, em passos legíveis

**What to build:** Compra e venda seguem gravando tudo numa transação e desfazendo por inteiro se a regra recusar. A trava, a leitura e a gravação deixam de ser um bloco único.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Uma compra aceita continua debitando o caixa, vinculando o jogador, abrindo o contrato e gravando a transação.
- [x] Uma compra ou venda recusada não grava nada.
- [x] Uma venda aceita continua creditando o caixa, encerrando o contrato e liberando o jogador.
- [x] Dentro da transação, travar, ler e gravar são passos separados.

## Comments

Compra e venda continuam numa transação só, com trava, leitura e gravação em passos separados.
