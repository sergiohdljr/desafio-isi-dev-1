# 05: Os testes de ponta a ponta esvaziam a liga do mesmo jeito

**What to build:** A suíte e2e continua isolada entre cenários. A limpeza de partidas, escalação, transações, contratos, jogadores e clubes fica num helper só.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Cada arquivo e2e que zera a liga usa o mesmo helper.
- [x] O helper apaga duelos, partidas, escalações, transações, contratos, jogadores e clubes, nessa ordem.
- [x] A suíte e2e continua passando.

## Comments

Os testes de ponta a ponta esvaziam a liga pelo mesmo helper, inclusive os jogadores.
