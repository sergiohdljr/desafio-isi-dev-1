# 02: Jogador em camadas

**What to build:** cadastrar, buscar, listar, editar, alterar a condição e excluir jogador continua igual para quem chama a API. A regra (nome, posição, idade, agilidade, indicadores, potencial, condição, valor de base, valor de mercado e overall) passa a viver no agregado Jogador. Cada operação vira um caso de uso. O Prisma só persiste e o controller só traduz HTTP.

O desenho fica sendo o padrão do próximo módulo (clube, mercado ou liga): um módulo Nest por feature; domínio, aplicação e adaptadores por dentro; núcleo compartilhado só para o que atravessa features. Sem CQRS, sem barramento de eventos e sem event sourcing.

**Blocked by:** 01: Remover o módulo hello

**Status:** ready-for-agent

- [x] O domínio do jogador não importa Nest, Prisma nem HTTP. Idade, posição com clube, condição, potencial, agilidade e os indicadores são regra do agregado
- [x] Valor de base, valor de mercado e overall são calculados no domínio. Moeda tem duas casas e arredonda para longe do zero quando o algarismo seguinte é 5. Moeda e a tradução de erro de domínio para `400`, `404` e `409` ficam fora do módulo de jogadores, prontas para o próximo feature
- [x] Cada operação já existente é um caso de uso. A porta do repositório fica no domínio; o adaptador Prisma a implementa e o módulo Nest liga os dois por token de injeção
- [x] Controller e DTOs continuam na borda HTTP. O corpo, os status, o cabeçalho `Location` e a lista paginada permanecem os mesmos, e os testes de ponta a ponta de jogadores seguem verdes

## Comments

Implementado: o módulo de jogadores ficou em domínio, casos de uso e adaptadores. Os limites de formato do pedido continuam na borda HTTP; a regra de negócio ficou no agregado.
