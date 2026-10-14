# 04: Vender com multa de fidelidade

**What to build:** Vender antes do fim da fidelidade cobra multa sobre o valor de mercado da venda, reduz o crédito no caixa e marca o contrato como rescindido. A multa tem teto de 10,00. O restante da venda continua igual: comissão, jogador livre e transação gravada na mesma operação.

**Blocked by:** 03: Vender um jogador com a fidelidade cumprida.

**Status:** resolved

- [x] Os dias restantes são o fim da fidelidade menos o instante da venda, em dias com fração, arredondados para cima. 116 dias, 17 horas e 35 minutos contam como 117. Se o fim já passou ou é o próprio instante, continuam 0.
- [x] O percentual é 0% com 0 dias, 5% de 1 a 30, 10% de 31 a 180 e 20% com 181 ou mais. `penalty_rate` é esse percentual como número JSON: `0`, `5`, `10` ou `20`. A multa é o valor de mercado da venda vezes o percentual, arredondada uma vez para 2 casas. Se o cálculo passar de 10,00, a multa é 10,00.
- [x] A partir do instante da venda: fim já passado gera 0 dias e 0%; 10 dias e 2 horas geram 11 dias e 5%; exatamente 30 dias geram 5%; 30 dias e 1 minuto geram 31 dias e 10%; exatamente 180 dias geram 10%; 180 dias e 1 minuto geram 181 dias e 20%; 200 dias geram 20%.
- [x] Com multa, `contract_status` é `RESCINDIDO`. Sem multa, continua `ENCERRADO`.
- [x] O crédito continua sendo valor de mercado menos multa menos comissão. Compra 37,00 e venda 40,00 com 10% geram multa 4,00, lucro 3,00, comissão 0,30 e crédito 35,70. Compra 50,00 e venda 42,50 com 20% geram multa 8,50, lucro −7,50, comissão 0,00 e crédito 34,00. Compra 26,15 e venda 30,00 com 5% geram multa 1,50, lucro 3,85, comissão 0,39 e crédito 28,11. Compra 60,00 e venda 75,00 com 20% calculam 15,00, limitam a multa a 10,00, e geram lucro 15,00, comissão 2,00 e crédito 63,00.
- [x] A multa gravada na venda é a da operação e não é recalculada depois. Recusa continua sem gravar.

## Comments

Implementado: a multa segue a faixa de dias, tem teto de 10,00 e rescinde o contrato. O crédito desconta essa multa.
