# Liga

API em NestJS e frontend em React. Detalhes por pasta: [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).

| Serviço | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Origem da API | http://localhost:3000 |
| Docs da API | http://localhost:3000/docs |

A origem da API é `http://localhost:3000`. O prefixo `/api/v1` não faz parte dessa origem.

## Pré-requisitos

A banca instala só os runtimes e o gerenciador oficial. O banco e o restante sobem pelos comandos da seção de execução.

| Ferramenta | Versão |
| --- | --- |
| Ubuntu | 24.04 |
| Node.js | 22 (com npm, que acompanha essa versão) |
| Docker Engine | com o plugin Docker Compose v2 |

Arquivos de trava versionados: `backend/package-lock.json` e `frontend/package-lock.json`. A instalação usa `npm ci` a partir desses arquivos e registros públicos do npm. As imagens `node:22-alpine`, `nginx:alpine` e `postgres:17-alpine` são públicas.

## Instalação e execução

Ubuntu 24.04, na raiz deste repositório. Sobe PostgreSQL 17, a API e o frontend a partir do código daqui.

```bash
cp .env.example .env
docker compose up --build
```

O Compose cria o banco vazio (`POSTGRES_DB` do `.env`) e a API aplica as migrations em `backend/prisma/migrations` ao iniciar (`prisma migrate deploy`). O schema fica sem jogadores, clubes, transações nem partidas.

- Origem da API: http://localhost:3000
- Frontend: http://localhost:5173

Parar:

```bash
docker compose down
```

Recriar o banco do zero (apaga o volume; o próximo `up` cria de novo, só com o schema):

```bash
docker compose down -v
```

Limpar os dados (jogadores, clubes, transações e partidas) e manter o schema. Com Node.js 22 no host e a API parada:

```bash
cd backend && npm ci && npm run db:clean
```

## Variáveis de ambiente

Modelo versionado: [.env.example](.env.example). Copie para `.env` na raiz. O Compose da aplicação lê só esse arquivo.

| Variável | Função |
| --- | --- |
| `POSTGRES_USER` | Usuário do Postgres |
| `POSTGRES_PASSWORD` | Senha do Postgres |
| `POSTGRES_DB` | Nome do banco da aplicação |
| `POSTGRES_PORT` | Porta do Postgres no host |
| `API_PORT` | Porta da API no host |
| `FRONTEND_ORIGIN` | Origem liberada no CORS (a URL do frontend) |

O `backend/.env.example` só define `PORT` da API quando ela roda no host. O e2e usa [.env.test](.env.test) (modelo: [.env.test.example](.env.test.example)). O `docker compose up` da aplicação não lê esse arquivo.

## Testes

O e2e usa um Compose próprio (`docker-compose.e2e.yml`) e o `.env.test` da raiz. Ele não sobe com o `docker compose up` da aplicação e não usa as portas 5432, 3000 e 5173.

Na raiz:

```bash
npm run compose:e2e
npm run compose:e2e:build
npm run compose:e2e:down
```

Backend (Vitest). O e2e sobe o Postgres de teste se precisar:

```bash
cd backend && npm ci
npm test
npm run test:e2e
```

Frontend. Unitários com Vitest; e2e com Playwright contra a API do Compose de e2e:

```bash
cd frontend && npm ci
npm test
npm run test:e2e:up
```

`test:e2e:up` reconstrói a imagem da API e roda a suíte. `npm run test:e2e` sobe o Compose se precisar e roda a suíte. O Playwright executa na imagem `mcr.microsoft.com/playwright` (Chromium incluso); o host não precisa de `playwright install`. Na primeira vez o Docker baixa essa imagem. Ao fim, o script derruba o Compose e2e. `E2E_KEEP_UP=1` mantém os serviços no ar.

Se as credenciais ou `POSTGRES_TEST_*` mudarem com volume antigo:

```bash
docker compose --env-file .env.test -f docker-compose.e2e.yml down -v
```

## Estrutura de pastas

Detalhes de execução de cada parte: [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).

```text
.env.example                 Credenciais e portas da app
.env.test                    Credenciais e portas do e2e (versionado)
.env.test.example            Modelo do .env.test
docker-compose.yml           Postgres + API + frontend
docker-compose.e2e.yml       Postgres de teste + API
package.json                 Scripts compose:e2e*
backend/                     Monolito modular
frontend/                    Package-by-feature
```

O backend é um monolito modular: um processo NestJS, um módulo por capacidade de negócio (`players`, `clubs`, `market`, `league`). Em cada módulo, `domain/` guarda a regra, `application/` os casos de uso e `infra/` o HTTP e o Prisma.

```text
backend/src/app.module.ts
backend/src/config/          Ambiente validado na subida
backend/src/common/          Filtro de erros, relógio e validação
backend/src/prisma/          PrismaService
backend/src/shared/          Tipos usados por mais de um módulo
backend/src/docs/            Schemas da documentação OpenAPI
backend/src/scripts/         Limpeza e dados de exemplo
backend/src/modules/<módulo>/
  domain/
  application/
  infra/
backend/prisma/migrations/   Schema versionado
```

O frontend segue package-by-feature. Cada feature em `src/features/` reúne `pages/`, `components/`, `api/`, `hooks/`, `utils/`, `types/` e `consts/`. Features: `home`, `players`, `clubs` e `league`.

```text
frontend/src/app/            Rotas e layout
frontend/src/components/ui/  Componentes visuais compartilhados
frontend/src/lib/            HTTP e utilitários gerais
frontend/src/assets/         Arquivos estáticos
frontend/src/test/           Setup e fixtures dos testes
frontend/src/features/<feature>/
  pages/
  components/
  api/
  hooks/
  utils/
  types/
  consts/
```

## Bibliotecas

Backend (`backend/package.json`):

| Biblioteca | Uso |
| --- | --- |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-fastify` | Módulos, controllers e o servidor HTTP em Fastify |
| `@nestjs/config` | Lê `PORT`, `FRONTEND_ORIGIN` e `DATABASE_URL` e valida na subida |
| `@fastify/helmet` | Cabeçalhos de segurança em toda resposta da API |
| `@fastify/rate-limit` | Teto de requisições por janela, configurado em `app.config` |
| `@prisma/client`, `@prisma/adapter-pg` | Consultas e transações no Postgres, via driver `pg` |
| `prisma` | Gera o client e aplica as migrations no start do container |
| `zod` | Valida body, query e param nas rotas pelo `ZodPipe` |
| `@scalar/fastify-api-reference` | Página interativa da OpenAPI em `/docs` |
| `reflect-metadata` | Metadados dos decorators do Nest |
| `rxjs` | Streams internos do Nest entre guards, pipes e controllers |
| `typescript` | Compila `src/` para `dist/` no build |
| `vitest`, `@nestjs/testing` | Testes unitários com módulos e Prisma mockados |
| `supertest` | E2e HTTP contra a API e o Postgres de teste |

Frontend (`frontend/package.json`):

| Biblioteca | Uso |
| --- | --- |
| `react`, `react-dom` | Telas e montagem no `index.html` |
| `vite`, `@vitejs/plugin-react` | Dev server, build e proxy de `/api` para a API |
| `react-router` | Rotas de home, jogadores, clubes e liga |
| `@tanstack/react-query` | Busca, cache e invalidação depois de criar, editar ou excluir |
| `axios` | Cliente HTTP único em `src/lib/http.ts`, com base `/api/v1` |
| `tailwindcss`, `@tailwindcss/vite` | Classes de estilo no markup, processadas pelo Vite |
| `tw-animate-css` | Animações dos diálogos e transições |
| `shadcn`, `@base-ui/react` | Primitivos dos componentes em `src/components/ui` |
| `class-variance-authority`, `cn` | Variantes de estilo e junção de classes |
| `lucide-react` | Ícones das ações e da navegação |
| `@fontsource-variable/geist` | Fonte carregada no CSS global |
| `typescript` | Checagem de tipos no `npm run build` |
| `vitest`, `@testing-library/react` | Testes de funções e de componentes com o DOM |
| `@playwright/test` | E2e no navegador contra a API do Compose de teste |

## Decisões e premissas

- Backend em clean architecture: cada módulo separa `domain`, `application` e `infra`. A regra de negócio não depende de HTTP nem de Prisma.
- O valor de mercado não é coluna: é função `IMMUTABLE` no Postgres, calculada a cada consulta como a RN05 exige. Um índice de expressão sobre ela permite filtrar, ordenar e paginar sem persistir o valor nem manter invariante de sincronização.
- As listagens filtram, ordenam e paginam no banco. Jogadores usa SQL cru, porque os critérios de valor e nome são chamadas de função que o `orderBy` declarativo do Prisma não alcança; os valores são sempre parâmetros e o `ORDER BY` vem do union type de ordenação, nunca de texto do cliente.
- A busca por nome ignora maiúsculas e acentos, comparando os dois lados com `nome_dobrado`. Um índice GIN de trigrama acelera o trecho no meio do nome; a ordem alfabética segue o code point, sem depender do idioma do servidor.
- Os índices espelham os predicados reais das consultas: compostos com a ordem do `ORDER BY` e parciais com o soft delete. Os de coluna única que viraram prefixo dos compostos foram removidos, então o custo de escrita não cresceu.
- Datas são `timestamptz`. Como a resposta converte para horário de Brasília, guardar hora de parede fazia o resultado depender do fuso do processo.
- Invariantes que só a aplicação garantia ganharam `CHECK` no banco, com os mesmos limites do schema de entrada. A caixa do clube é atualizada com `increment` atômico, e o valor resultante vem do próprio `UPDATE`.
- Frontend organizado por feature (`src/features/<feature>/`): páginas, componentes, API e utils ficam juntos no módulo da tela.
- Dados do frontend com TanStack Query: a consulta busca, guarda em cache e repete em caso de falha; loading e erro ficam na query. Depois de criar, editar ou excluir, a mutation invalida as queries relacionadas.
- A listagem de jogadores faz uma única requisição por filtro. A resposta traz a página e os totais das abas (todos, livres e em clubes) no mesmo `meta` para evitar fazer multiplos requests, retornando além do contrato esperado o campo `meta.count`{ all: 1, free: 1, signed: 0 },.
- No Compose, o frontend acessa a API pelo proxy do nginx (`/api` → API).
- A aplicação inteira sobe no Docker Compose: Postgres, API e frontend. O Compose de e2e é separado e não entra no `docker compose up` da app.
- Backend: unitários (Vitest, com Prisma e HTTP mockados) e e2e (Supertest contra a API e o Postgres de teste).
- Frontend: unitários (Vitest), de componente (Testing Library) e e2e (Playwright contra a API no Compose de e2e). O e2e usa ambiente próprio (`.env.test`, `docker-compose.e2e.yml`, portas `E2E_*` e `POSTGRES_TEST_*`) e não mexe no stack de desenvolvimento.
- O Playwright do e2e do frontend roda na imagem oficial `mcr.microsoft.com/playwright`, na mesma versão do `@playwright/test`. O host só precisa de Node e Docker: a imagem já traz o Chromium e as bibliotecas do sistema, então um Linux mínimo não instala navegador nem pacotes nativos. O Compose de Postgres e API continua no host; o container usa a rede do host para alcançar a API em `127.0.0.1`.
- Testes de usecases usando repositorios em memória, focando apenas na lógica.
- Cada requisição da API gera uma linha de log com método, caminho e status, pelo `Logger` do Nest. O filtro global também registra os erros.
- Documentação OpenAPI em `/docs`, com os endpoints da API.
- ESLint e Prettier no frontend (`npm run lint` e `npm run format:check`).

## Funcionalidades não implementadas

Nenhuma.

## Uso de inteligência artificial

Usei o Cursor, com o modelo Grok, para implementar a API, a interface e os testes. Revisei o código e os comandos deste repositório antes de entregá-los.
