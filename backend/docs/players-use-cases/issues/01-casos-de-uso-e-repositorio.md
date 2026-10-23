# 01: Casos de uso numa pasta, falando só com a interface do repositório

**What to build:** cadastrar, buscar, listar, editar, alterar a condição e excluir jogador continua igual para quem chama a API. Todos os casos de uso ficam numa única pasta. Cada um pede e grava jogador só pela interface do repositório. Só o adaptador de banco implementa essa interface. A pasta dos casos de uso não conhece HTTP nem o banco.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] Os seis casos de uso do jogador estão numa única pasta, e nenhum outro tipo de classe dessa pasta fala com HTTP ou com o banco
- [x] A persistência do jogador é uma interface; o adaptador de banco é a única implementação
- [x] Corpo, status, cabeçalho `Location` e lista paginada permanecem os mesmos, e os testes de ponta a ponta de jogadores seguem verdes

## Comments

Implementado: os seis casos de uso ficam numa pasta e persistem só pela interface do repositório.
