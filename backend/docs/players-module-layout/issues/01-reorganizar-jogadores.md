# 01: Reorganizar o módulo de jogadores

**What to build:** cadastrar, buscar, listar, editar, alterar a condição e excluir jogador continua igual para quem chama a API. Por dentro, o módulo separa aplicação, domínio e infraestrutura. A interface do repositório fica na aplicação; só o adaptador de banco a implementa. A regra do agregado continua na entidade.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] O módulo tem `application/repositories`, `application/use-cases`, `domain/entities`, `infra/http` e `infra/repositories`
- [x] Arquivos em kebab-case: porta `players-repository`, implementação `prisma-players-repository`, um caso de uso por arquivo (`create-player`, `find-player`, `list-players`, `update-player`, `change-player-condition`, `delete-player`), classe e porta no mesmo arquivo
- [x] A ordenação da lista não se chama como o caso de uso. Moeda, erro de domínio, Prisma e o filtro HTTP continuam fora do módulo
- [x] Corpo, status, cabeçalho `Location` e lista paginada permanecem os mesmos, e os testes de ponta a ponta de jogadores seguem verdes

## Comments

Implementado: cada módulo de jogador separa aplicação, domínio e infraestrutura. A ordenação da lista é `arrangePlayers`.
