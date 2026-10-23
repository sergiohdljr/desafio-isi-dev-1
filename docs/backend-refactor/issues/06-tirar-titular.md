# 06: Venda e doença tiram o titular pela mesma operação

**What to build:** Vender um titular, ou marcá-lo como `DOENTE`, continua tirando só esse jogador da escalação na mesma transação. A exclusão da vaga não fica copiada em dois repositórios.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] A venda de um titular deixa a escalação incompleta, com a formação salva e os demais titulares.
- [x] Marcar um titular como `DOENTE` faz o mesmo, na mesma operação da condição.
- [x] Os dois caminhos chamam a mesma exclusão da vaga.

## Comments

Venda e doença liberam a vaga do titular pela mesma operação, dentro da transação.
