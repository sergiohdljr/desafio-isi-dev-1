# 01: Comprar um jogador livre

**What to build:** Alguém compra um jogador livre para um clube, informando o fim da fidelidade. O preço é o valor de mercado na hora, nunca o valor base. Numa única operação o custo sai do caixa, o jogador entra no elenco, nasce o contrato ativo e fica gravada a compra. A resposta mostra o valor pago, a taxa, o custo, o contrato e o caixa novo. Pedido inválido ou recurso inexistente não grava nada.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `POST /api/v1/players/{id}/buy` com `club_id` e `loyalty_until` responde `200` e `Content-Type: application/json`. A resposta traz `id`, `club_id`, `player_id`, `player_name`, `type` `COMPRA`, `value`, `fee`, `penalty`, `profit`, `cash_change`, `created_at`, `contract` (`purchase_value`, `loyalty_until`, `status` `ATIVO`) e `club_cash`. Números são JSON numérico.
- [x] `value` e `purchase_value` são o valor de mercado no instante da compra. `penalty` é `0`. `profit` é nulo. `cash_change` é `-(value + fee)`. `club_cash` é o caixa depois da compra. `player_name` é o nome do jogador nesse instante.
- [x] A taxa é 5% do valor de mercado, cobrada só quando esse valor é maior que 30,00, e arredondada uma única vez para 2 casas, com o algarismo 5 para longe do zero. O custo total é valor de mercado mais taxa. Com caixa 300,00: mercado 28,00 gera taxa 0,00 e custo 28,00; mercado 30,00 gera taxa 0,00 e custo 30,00; mercado 30,01 gera taxa 1,50 (1,5005 arredondado) e custo 31,51. Com caixa 100,00, mercado 47,62 gera taxa 2,38 e custo 50,00, igual à metade do caixa, e a compra é aceita.
- [x] A mesma operação desconta o custo do caixa, associa o jogador ao clube, cria o contrato ativo com o valor de compra (sem a taxa) e o fim da fidelidade, e grava a transação de compra. Em seguida, o detalhe do clube mostra o jogador no elenco com esse contrato, e o detalhe do jogador mostra o `club_id`. Valor de elenco e patrimônio passam a incluir o valor de mercado dele.
- [x] `loyalty_until` chega no horário de Brasília, `AAAA-MM-DDTHH:MM-03:00`. Precisa ser depois do instante da compra e no máximo 1.095 dias depois. Na resposta, `loyalty_until` e `created_at` saem como `AAAA-MM-DDTHH:MM:SS-03:00`. Brasília é sempre `-03:00`.
- [x] Corpo que não é objeto JSON, campo obrigatório ausente ou nulo, `club_id` que não é inteiro positivo (`0`, negativo, fração ou string), data em outro formato, data ou hora inexistente, fidelidade que não é futura ou que passa de 1.095 dias respondem `400` com `message` não vazio, sem stack trace, e não gravam compra, contrato nem mudança de caixa ou elenco.
- [x] Jogador inexistente ou excluído na URL, ou `club_id` de clube inexistente, responde `404` com `message` não vazio e não grava. Id da URL que não é inteiro positivo só com dígitos, sem zero à esquerda, ou maior que 2147483647, responde `404`.
- [x] Campo desconhecido ou controlado pela API no corpo é ignorado.

## Comments

Implementado: a compra debita valor de mercado mais taxa, abre o contrato ativo e grava a transação na mesma operação.
