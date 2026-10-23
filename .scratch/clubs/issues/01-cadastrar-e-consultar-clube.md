# 01: Cadastrar e consultar um clube

**What to build:** Alguém cria um clube com nome e sigla e em seguida abre esse clube. Ele nasce com 300,00 em caixa, sem jogadores, valor de elenco 0,00 e patrimônio 300,00. O caixa não muda neste fluxo. Nome repetido só por maiúsculas, sigla repetida e o 21º clube são recusados sem gravar. Acento diferente no nome é outro clube. A unicidade do nome vale também no banco.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `POST /api/v1/clubs` com `name` e `acronym` responde `201`, com `Content-Type: application/json` e `Location` apontando para `/api/v1/clubs/{id}`. A resposta traz `id`, `name`, `acronym`, `cash`, `squad_value` e `net_worth`.
- [x] O clube nasce com caixa `300.00`, valor de elenco `0.00` e patrimônio `300.00`. `GET /api/v1/clubs/{id}` responde `200` com esses campos e `players` vazio. Números são JSON numérico.
- [x] O nome, depois de tirar espaços das pontas e colapsar espaços repetidos, tem 3–60 caracteres, 2–5 palavras, e só letras, espaços, hífen e ponto. `"  Águias   FC "` grava `"Águias FC"`. Caractere de controle, campo ausente ou nulo, ou nome fora do limite responde `400` e não grava.
- [x] A sigla tem exatamente 3 letras `A`–`Z`, maiúsculas e sem acento. As três aparecem no nome nessa ordem, sem diferenciar maiúsculas e acentos, a primeira é a primeira letra do nome, e as três não são iguais. `"Águias FC"` aceita `"AFC"`. `"afc"`, `"AAA"` e uma sigla cuja primeira letra não é a do nome respondem `400` e não gravam.
- [x] Com `"Águias FC"` cadastrado, `"  águias   fc "` responde `409` e não grava. `"Aguias FC"` é aceito. A mesma distinção vale no banco: nomes que só diferem por maiúsculas não podem coexistir; nomes que diferem por acento podem.
- [x] Sigla já cadastrada responde `409` e não grava. O 20º clube é aceito; o 21º responde `409` e não grava.
- [x] `cash`, `id` e qualquer campo desconhecido no cadastro são ignorados. Corpo que não é um objeto JSON responde `400` e não grava.
- [x] `GET /api/v1/clubs/{id}` de clube inexistente, ou de id que não é inteiro positivo só com dígitos e sem zero à esquerda (`abc`, `0`, `-1`, `1.5`, `01`, acima de 2147483647), responde `404` com `message` não vazio e sem stack trace.

## Comments

Implementado: o clube nasce com 300 de caixa. A unicidade do nome sem diferenciar maiúsculas, e preservando acento, fica na coluna gerada `nome_chave`.
