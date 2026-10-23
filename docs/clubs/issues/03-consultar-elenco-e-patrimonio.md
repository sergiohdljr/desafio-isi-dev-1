# 03: Consultar elenco, contrato e patrimônio

**What to build:** Alguém abre um clube e vê o elenco de trás para a frente, o contrato de cada jogador e os totais do clube. O valor do elenco é a soma dos valores de mercado. O patrimônio é o caixa mais esse valor. Dias restantes saem do fim da fidelidade. Nada disso fica gravado. O percentual de multa fica para a RN15 e não entra neste ticket.

**Blocked by:** 01: Cadastrar e consultar um clube

**Status:** resolved

- [x] `GET /api/v1/clubs/{id}` traz `players`. Cada jogador tem os mesmos campos da consulta de um jogador e um `contract` com `purchase_value`, `loyalty_until` e `remaining_days`. `loyalty_until` vem como `AAAA-MM-DDTHH:MM:SS-03:00`.
- [x] O elenco ordena pela posição GOL, ZAG, LAT, MEI, ATA, depois pelo nome na ordem alfabética do enunciado, depois pelo id crescente. Jogador excluído não aparece.
- [x] `remaining_days` é o tempo até `loyalty_until` a partir do instante da consulta, arredondado para cima. Valor de elenco é a soma dos valores de mercado dos jogadores do clube. Patrimônio é o caixa mais o valor do elenco. Os dois resultados saem com 2 casas, arredondados uma vez no fim, meio para longe do zero. Valor de mercado já arredondado entra na soma como está.
- [x] Valor de elenco, patrimônio e dias restantes são calculados na consulta e não ficam gravados. Clube sem jogadores continua com `players` vazio, valor de elenco `0.00` e patrimônio igual ao caixa.

## Comments

Implementado: o elenco, os dias restantes e o patrimônio são calculados na consulta. O percentual de multa ficou de fora.
