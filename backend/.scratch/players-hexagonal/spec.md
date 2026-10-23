# Jogadores em camadas

Recorte aprovado: só o módulo de jogadores, o único implementado. Clubes, mercado e liga ficam para depois e devem copiar o mesmo desenho.

O módulo Nest continua sendo a unidade de feature. Por dentro, a dependência aponta para o domínio: a regra mora no agregado, o caso de uso orquestra, HTTP e Prisma são adaptadores. Moeda e a tradução de erro de domínio para HTTP ficam fora do módulo, para o próximo feature reutilizar. Sem CQRS e sem event sourcing.

O módulo hello sai da aplicação.
