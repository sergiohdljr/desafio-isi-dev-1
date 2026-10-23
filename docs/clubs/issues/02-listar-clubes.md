# 02: Listar clubes

**What to build:** Alguém lista os clubes, sem o elenco. A ordem padrão é o nome. Dá para ordenar pelo patrimônio calculado, do menor para o maior ou o contrário. Empate desempata pelo nome e depois pelo id.

**Blocked by:** 01: Cadastrar e consultar um clube

**Status:** resolved

- [x] `GET /api/v1/clubs` responde `200` com um array JSON. Cada item tem `id`, `name`, `acronym`, `cash`, `squad_value` e `net_worth`, e não traz `players`. Sem clubes, o array é vazio.
- [x] `sort` padrão é `name`. Os valores aceitos, um só, são `name`, `net_worth_asc` e `net_worth_desc`. O patrimônio usado na ordenação é o calculado (caixa + valor do elenco), nunca um valor gravado.
- [x] O nome segue a ordem alfabética do enunciado: minúsculas, sem acentos, comparação Unicode caractere a caractere. “Épsilon” fica entre “Delta” e “Gama”; “Ana Lima” vem antes de “Ana-Maria”. Em qualquer ordenação, o empate se desfaz pelo nome e depois pelo id crescente.
- [x] `sort` presente e vazio, com mais de um critério, com espaço, ou fora da lista (inclusive maiúsculas trocadas, como `NAME`) responde `400`. Nome de parâmetro desconhecido é ignorado.

## Comments

Implementado: a lista não traz elenco. O patrimônio soma o valor de mercado dos jogadores ativos do clube.
