# 03: Vender um jogador com a fidelidade cumprida

**What to build:** Alguém vende um jogador do elenco pelo valor de mercado do momento, sem enviar corpo. Quando a fidelidade já acabou, não há multa, o contrato encerra, o lucro e a comissão são calculados, o crédito entra no caixa e o jogador volta a ficar livre. A venda fica gravada na mesma operação. Jogador livre não pode ser vendido.

**Blocked by:** 01: Comprar um jogador livre.

**Status:** ready-for-agent

- [ ] `POST /api/v1/players/{id}/sell` responde `200` e `Content-Type: application/json`. Não lê corpo; um corpo enviado é ignorado. A resposta traz os campos da transação (`id`, `club_id`, `player_id`, `player_name`, `type` `VENDA`, `value`, `fee`, `penalty`, `profit`, `cash_change`, `created_at`) e ainda `purchase_value`, `remaining_days`, `penalty_rate`, `contract_status` e `club_cash`.
- [ ] `value` é o valor de mercado no instante da venda. `purchase_value` é o valor gravado no contrato ativo (o de mercado pago na compra, sem a taxa). `profit` é a venda menos esse valor de compra, positivo ou negativo. `player_name` é o nome nesse instante. `created_at` sai como `AAAA-MM-DDTHH:MM:SS-03:00`.
- [ ] Se o fim da fidelidade já passou, ou é o próprio instante da venda, `remaining_days` é 0, `penalty` é 0, `penalty_rate` é 0 e `contract_status` é `ENCERRADO`.
- [ ] A comissão só existe quando o lucro é maior que zero. É 10% da parte do lucro até 10,00 mais 20% da parte acima de 10,00, somadas e arredondadas uma única vez no final, com o algarismo 5 para longe do zero. Lucro 3,00 gera 0,30. Lucro 3,85 gera 0,39. Lucro 10,00 gera 1,00. Lucro 10,01 gera 1,00. Lucro 15,00 gera 2,00. Lucro −7,50 gera 0,00. `fee` é essa comissão.
- [ ] `cash_change` e o crédito no caixa são valor de mercado menos multa menos comissão. `club_cash` é o caixa depois. Compra 25,00 e venda 25,00, sem multa, geram lucro 0,00, comissão 0,00 e crédito 25,00.
- [ ] A mesma operação encerra o contrato, credita o caixa, deixa o jogador livre e grava a venda. O detalhe do jogador fica com `club_id` nulo. O detalhe do clube deixa de listá-lo, e o caixa, o valor de elenco e o patrimônio acompanham a saída.
- [ ] Vender jogador livre responde `409` com `message` não vazio e não grava. Jogador inexistente ou excluído responde `404`. Id da URL inválido, no mesmo critério dos outros recursos, responde `404`.
