# Módulo de jogadores na árvore por camada

Cada módulo futuro (clube, liga) copia esta árvore. O recorte agora é só jogadores. Moeda, erro de domínio, Prisma e o filtro HTTP continuam fora do módulo.

Pastas: `application/repositories`, `application/use-cases`, `domain/entities`, `infra/http`, `infra/repositories`. Arquivos em kebab-case. A porta do repositório é `players-repository`; a implementação é `prisma-players-repository`. Cada caso de uso é um arquivo `verbo-recurso`, com a classe e a porta juntas. A ordenação da lista não usa o nome do caso de uso.

Testes unitários dos casos de uso ficam em `application/use-cases/__tests__`, com repositório falso. A regra do agregado continua testada na entidade.
