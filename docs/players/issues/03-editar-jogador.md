# 03: Editar jogador

**What to build:** Alguém edita o nome, a posição, a agilidade e a idade de um jogador. Os indicadores, o potencial e o valor base continuam os do cadastro. A consulta passa a usar a nova posição no overall e a nova idade e agilidade no valor de mercado.

**Blocked by:** 01: Cadastrar e consultar um jogador

**Status:** resolved

- [x] `PUT /api/v1/players/{id}` exige `name`, `position`, `agility` e `age`, mesmo quando só um deles muda, e responde `200` com o jogador atualizado.
- [x] Indicadores, potencial e valor base permanecem os gravados no cadastro. Campos enviados além desses quatro são ignorados. O overall é recalculado com a posição nova. O valor de mercado usa a idade e a agilidade novas e o mesmo valor base.
- [x] Idade menor que a atual responde `409` e não grava. Jogador que já tem clube não muda de posição: responde `409` e não grava. Levar a idade a 33 anos ou mais não altera o potencial.
- [x] Com 35 anos ou mais, agilidade acima de 85 responde `400`. Corpo inválido responde `400` e não grava. Jogador inexistente responde `404`.
