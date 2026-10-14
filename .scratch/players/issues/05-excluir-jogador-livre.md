# 05: Excluir jogador livre

**What to build:** Alguém exclui um jogador que não tem clube. O jogador deixa de existir para a API, mas o registro permanece no banco. Jogador que está num clube não pode ser excluído.

**Blocked by:** 02: Alterar a condição física; 03: Editar jogador; 04: Listar jogadores

**Status:** resolved

- [x] `DELETE /api/v1/players/{id}` de um jogador livre responde `204` sem corpo e grava o momento da exclusão. Nenhuma linha é apagada.
- [x] Depois disso, a consulta, a edição, a alteração de condição e uma nova exclusão respondem `404`. O jogador não aparece em `GET /api/v1/players`.
- [x] Jogador que está num clube responde `409` e continua existindo, sem data de exclusão.
- [x] Id inexistente ou jogador já excluído responde `404`.
