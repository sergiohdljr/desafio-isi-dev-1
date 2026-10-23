# 02: Testes unitários dos casos de uso

**What to build:** cada caso de uso do jogador é verificável sem banco e sem HTTP. O teste usa um repositório falso e observa a orquestração: jogador inexistente, clube inexistente na lista, gravação quando a condição muda e ausência de gravação quando ela permanece. Valor, idade e condição continuam cobertos pelo teste da entidade.

**Blocked by:** 01: Reorganizar o módulo de jogadores

**Status:** ready-for-agent

- [x] Os testes ficam em `application/use-cases/__tests__` e não abrem Prisma nem sobem a API
- [x] Busca, edição, condição e exclusão de um id inexistente falham como recurso ausente, e nada é gravado
- [x] Listar com um clube inexistente falha como recurso ausente
- [x] Alterar a condição grava só quando ela muda; repetir a condição atual não grava

## Comments

Implementado: os casos de uso rodam contra um repositório falso, sem Prisma e sem HTTP.
