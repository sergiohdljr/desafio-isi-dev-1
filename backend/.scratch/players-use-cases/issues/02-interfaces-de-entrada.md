# 02: O controller depende de interfaces de entrada

**What to build:** quem chama a API de jogadores recebe o mesmo contrato. O controller deixa de depender da classe concreta de cada caso de uso: chama uma interface por operação, e essas interfaces ficam na mesma pasta dos casos de uso. Cada caso devolve um modelo de resposta, e um presenter monta o JSON. A interface do repositório continua sendo a única porta de persistência.

**Blocked by:** 01: Casos de uso numa pasta, falando só com a interface do repositório

**Status:** ready-for-agent

- [x] Cada operação de jogador tem uma interface de entrada na pasta dos casos de uso, e o controller depende dessa interface
- [x] O caso de uso devolve um modelo de resposta; o presenter traduz esse modelo para o JSON atual, sem callback
- [x] O caso de uso não devolve o agregado para o controller, e a única porta de persistência segue sendo a interface do repositório
- [x] Corpo, status, cabeçalho `Location` e lista paginada permanecem os mesmos, e os testes de ponta a ponta de jogadores seguem verdes

## Comments

Implementado: o controller chama uma porta por operação. A exclusão devolve vazio, porque o sucesso é `204` sem corpo.
