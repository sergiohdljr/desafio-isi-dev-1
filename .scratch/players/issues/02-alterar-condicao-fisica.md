# 02: Alterar a condição física

**What to build:** Alguém muda a condição física de um jogador. A consulta seguinte mostra o valor de mercado recalculado com o desconto dessa condição. Enviar a condição que ele já tem não muda nada. Um jogador doente não passa direto para apto.

**Blocked by:** 01: Cadastrar e consultar um jogador

**Status:** resolved

- [x] `PATCH /api/v1/players/{id}/condition` com `condition` em `APTO`, `MAL_CONDICIONADO` ou `DOENTE` responde `200` com o jogador no mesmo formato da consulta.
- [x] Apto desconta 0%. Mal condicionado desconta 15%. Doente desconta 30%. Esse desconto só muda se o jogador não está apto: agilidade de 80 a 100 reduz o desconto pela metade; de 1 a 30 soma 10 pontos percentuais; de 31 a 79 não altera.
- [x] O percentual total é o ajuste de idade menos esse desconto, limitado a −40%. O valor de mercado é o valor base vezes (100 + percentual total) ÷ 100, arredondado uma vez para 2 casas, com meio para longe do zero, e piso 1,00.
- [x] Valor base 82,00, mal condicionado, agilidade 80 e 21 anos resulta em 84,05. Valor base 82,00, doente, agilidade 10 e 40 anos resulta em 49,20. Valor base 9,50, mal condicionado, agilidade 85 e 25 anos resulta em 8,79. Valor base 1,00, mal condicionado, agilidade 50 e 35 anos resulta em 1,00.
- [x] Enviar a condição atual responde `200` e não altera o jogador.
- [x] De `DOENTE` direto para `APTO` responde `409` e não grava. `condition` ausente, nula ou fora da lista responde `400` e não grava. Jogador inexistente responde `404`.
