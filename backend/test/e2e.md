# Testes e2e

## Banco

O e2e usa o serviço `postgres-test` do `docker-compose.yml`, na porta 5433, com o banco `liga_teste` criado pela imagem. O Postgres da aplicação não entra nessa suíte. Copie `.env.test.example` para `.env.test` e use o mesmo usuário e senha do `.env`, na porta 5433. `npm run test:e2e:up` sobe esse serviço, espera o healthcheck e roda a suíte. `npm run test:e2e` só roda a suíte, com o serviço já no ar: carrega `.env.test`, aplica `prisma migrate deploy` e executa os arquivos em série. Cada arquivo em `test/flows/` abre a aplicação uma vez e esvazia a liga antes de cada caso, com `resetLeague`.

Cada fluxo tem um caso feliz e o erro que a borda HTTP traduz. O teste confere o status, o corpo e se a operação recusada gravou alguma coisa. Percentual, faixa, arredondamento e teto ficam no teste unitário da função que calcula.

## Jogadores

- Cadastrar um jogador e consultar: a resposta traz o overall calculado e o valor base gravado.
- Alterar a condição e consultar de novo: o valor de mercado muda; o valor base permanece.
- `PUT` muda nome, posição, agilidade e idade. Potencial e valor base continuam os do cadastro. Idade menor, ou troca de posição com o jogador no elenco, responde `409` e não grava.
- `GET /players` devolve a página pedida, com `total_items` de todos os que passam no filtro, e página além da última com `data` vazio. Um filtro inválido responde `400`.
- `DELETE` de jogador livre responde `204` sem corpo. A linha continua no banco, com `excluido_em` preenchido. O mesmo id responde `404` na consulta, na edição, na condição e num novo `DELETE`, e some da listagem.
- `DELETE` de jogador no elenco responde `409` e não preenche `excluido_em`.

## Clubes

- Criar um clube: caixa 300,00, elenco vazio, patrimônio igual ao caixa.
- Nome igual ignorando maiúsculas responde `409` e não grava. Nome que só difere no acento é aceito. Sigla repetida responde `409`. O 21º clube responde `409`.
- `GET /clubs` ordena pelo nome e, com `sort` de patrimônio, pelo patrimônio calculado. Empate segue nome e id.
- `GET /clubs/{id}` traz o elenco na ordem GOL, ZAG, LAT, MEI, ATA, o contrato de cada titular e o patrimônio igual a caixa mais a soma dos valores de mercado.

## Compra

- Comprar um jogador livre: o caixa cai o custo total, o jogador entra no elenco, nasce um contrato `ATIVO` com o valor de mercado (sem a taxa) e a fidelidade enviada, e o histórico ganha uma `COMPRA`.
- Custo acima de 50% do caixa, jogador que já tem clube, ou recompra pelo clube que o vendeu, responde `409` e não grava contrato nem transação. Outro clube pode comprar esse jogador.
- Jogador ou clube inexistente responde `404`. Corpo inválido responde `400`.

## Venda

- Vender um jogador do elenco: o caixa sobe o crédito, o contrato deixa de estar `ATIVO`, o jogador fica livre e o histórico ganha uma `VENDA` com multa, comissão, lucro e `cash_change`.
- Jogador livre responde `409` e não grava a venda.

## Histórico e CSV

- `GET /clubs/{id}/transactions` lista da mais recente para a mais antiga. `300,00` mais a soma de `cash_change` é o caixa atual. Mudar o nome do jogador depois não altera `player_name` já gravado.
- Filtrar por `type` e por `player_id` restringe a lista e o `summary`. Clube sem transações, ou jogador sem transação naquele clube, responde `200` com `data` vazio e totais em 0,00. Filtro inválido responde `400`. Clube ou jogador inexistente responde `404`.
- `GET /clubs/{id}/transactions/export` devolve `text/csv` em UTF-8, sem BOM, com o mesmo filtro e a mesma ordem. Sem transações, só o cabeçalho. Erro de filtro continua em JSON.

## Escalação e partidas

- O clube nasce sem escalação: `formation` nulo, `players` vazio, `complete` falso. `PUT` de uma formação válida grava os 5 titulares e não mexe no caixa. Formação que não fecha, jogador de outro clube ou `DOENTE` responde `409` e não grava. Corpo inválido responde `400`.
- Vender um titular, ou marcá-lo `DOENTE`, tira esse jogador da escalação na mesma operação. A formação permanece e `complete` fica falso. Voltar a ficar apto não recoloca o jogador.
- `POST /matches` com as duas escalações completas responde `201`, grava a partida e os 6 duelos, e não altera caixa, elenco nem jogadores. Mandante igual ao visitante ou corpo inválido responde `400`. Clube inexistente responde `404`. Escalação incompleta responde `409` e não grava.
- `GET /matches` lista da mais recente para a mais antiga. `GET /matches/{id}` devolve os 6 duelos. Editar o jogador depois não muda o duelo gravado.
- `GET /standings` lista todos os clubes, inclusive os que não jogaram, com posição única. A ordem é pontos, saldo, gols marcados e nome.
