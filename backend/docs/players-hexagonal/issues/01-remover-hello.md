# 01: Remover o módulo hello

**What to build:** a aplicação sobe só com configuração, banco e jogadores. A rota de saudação do starter deixa de existir. Quem chama a raiz da API recebe o mesmo tratamento de caminho inexistente já usado no resto da API.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] O módulo hello, o controller, o service e o teste dele saem do código e do módulo raiz
- [x] A aplicação sobe e os endpoints de jogadores continuam respondendo como antes
- [x] Não resta rota, provider nem teste que devolva a saudação do starter

## Comments

Implementado: a raiz `/api/v1` responde 404 como qualquer caminho inexistente, e o módulo hello saiu da aplicação.
