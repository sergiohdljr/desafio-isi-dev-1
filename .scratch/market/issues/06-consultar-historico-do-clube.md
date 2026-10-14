# 06: Consultar o histórico do clube

**What to build:** Alguém consulta todas as compras e vendas de um clube, da mais recente para a mais antiga, e vê o resumo dos totais. Cada transação guarda o nome e os valores do momento e não muda se o jogador mudar depois. A soma das variações de caixa, a partir dos 300,00 iniciais, fecha com o caixa atual.

**Blocked by:** 01: Comprar um jogador livre. 03: Vender um jogador com a fidelidade cumprida.

**Status:** ready-for-agent

- [ ] `GET /api/v1/clubs/{id}/transactions` responde `200` com `data` e `summary`. Cada item traz `id`, `club_id`, `player_id`, `player_name`, `type`, `value`, `fee`, `penalty`, `profit`, `cash_change` e `created_at`. Na compra, `type` é `COMPRA`, `penalty` é 0, `profit` é nulo e `cash_change` é `-(value + fee)`. Na venda, `type` é `VENDA`, `fee` é a comissão, `penalty` é a multa e `profit` é o lucro com sinal.
- [ ] A lista vem da mais recente para a mais antiga. No empate de data e hora, o `id` maior vem primeiro.
- [ ] A transação não é recalculada nem editada. Se o jogador mudar de nome ou de valor depois, `player_name`, `value` e os demais números continuam os gravados na operação.
- [ ] Para qualquer clube, 300,00 mais a soma de `cash_change` de todas as transações dele é o caixa atual.
- [ ] `summary` soma só as transações devolvidas, com 2 casas: `total_spent` é `value + fee` das compras; `total_received` é `cash_change` das vendas; `total_fees` é `fee` de todas; `total_penalties` é `penalty` das vendas; `total_profit` é `profit` das vendas, com sinal. Sem transações, `200` com `data` vazio e os cinco totais em 0,00.
- [ ] Clube inexistente, ou id da URL inválido no mesmo critério dos outros recursos, responde `404` com `message` não vazio e sem stack trace.
