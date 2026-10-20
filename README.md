# Liga

API em NestJS e frontend em React. Detalhes por pasta: [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).

| Serviço | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 (`/api/v1`) |
| Docs da API | http://localhost:3000/docs |

## Como rodar (Docker Compose)

Forma recomendada. Sobe Postgres, API e frontend. A API aplica as migrations ao iniciar.

**Pré-requisito:** Docker com Compose (Ubuntu 24.04). Imagem do banco: `postgres:17-alpine`.

```bash
cp .env.example .env
docker compose up --build
```

| Serviço | Porta |
| --- | --- |
| Frontend | 5173 |
| API | 3000 (`API_PORT`) |
| Postgres | 5432 (`POSTGRES_PORT`) |

O banco nasce vazio. Dados de exemplo (opcional), com a API parada e Node no host:

```bash
cd backend && npm ci && npm run db:reset
```

Parar:

```bash
docker compose down
```

## Variáveis de ambiente

Só o `.env` na raiz é necessário para o Compose da app. Modelo: [.env.example](.env.example).

| Variável | Função |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciais do Postgres |
| `POSTGRES_DB` | Nome do banco da aplicação |
| `POSTGRES_PORT` | Porta do Postgres no host |
| `API_PORT` | Porta da API no host |
| `FRONTEND_ORIGIN` | Origem liberada no CORS (use a URL do frontend) |

O e2e usa [.env.test](.env.test) (modelo: [.env.test.example](.env.test.example)), com `POSTGRES_*` de teste, `POSTGRES_TEST_*` e `E2E_*`. O `docker compose up` da aplicação não lê esse arquivo.

## Desenvolvimento na máquina (opcional)

Quando for alterar código com hot reload. Exige Node.js 22 e npm.

```bash
cp .env.example .env
cp backend/.env.example backend/.env   # opcional: só PORT da API no host
docker compose up -d postgres

cd backend && npm ci && npx prisma migrate deploy && npm run start:dev
# outro terminal
cd frontend && npm ci && npm run dev
```

A API monta `DATABASE_URL` a partir do `.env` da raiz. O Vite encaminha `/api` para `http://127.0.0.1:3000`.

## Testes

Stack isolado em `docker-compose.e2e.yml` (não sobe com o Compose da app).

```bash
# na raiz — sobe/derruba o Compose e2e
npm run compose:e2e
npm run compose:e2e:build
npm run compose:e2e:down

# frontend (Playwright; :up reconstrói a imagem da API)
cd frontend && npm run test:e2e:up
# ou, com o Compose e2e já no ar:
cd frontend && npm run test:e2e

# backend (Vitest/Supertest; sobe só o Postgres de teste)
cd backend && npm run test:e2e
```

Se mudar credenciais ou `POSTGRES_TEST_*` no `.env.test` com volume antigo:

```bash
docker compose --env-file .env.test -f docker-compose.e2e.yml down -v
```

## Estrutura

```text
.env.example            Credenciais e portas da app
.env.test               Credenciais e portas do e2e (versionado)
.env.test.example       Modelo do .env.test
docker-compose.yml      App (Postgres + API + frontend)
docker-compose.e2e.yml  E2e (Postgres de teste + API)
package.json            Scripts compose:e2e*
backend/                API NestJS e Prisma
frontend/               Interface React
```

## Bibliotecas

Backend: NestJS (Fastify), Prisma, Zod, Vitest, Supertest, TypeScript.

Frontend: React, Vite, React Router, TanStack Query, Axios, Tailwind, shadcn/Base UI, Vitest, Playwright, TypeScript.

## Decisões e premissas

- Backend em clean architecture: cada módulo separa `domain`, `application` e `infra`. A regra de negócio não depende de HTTP nem de Prisma.
- Frontend organizado por feature (`src/features/<feature>/`): páginas, componentes, API e utils ficam juntos no módulo da tela.
- Dados do frontend com TanStack Query: a consulta busca, guarda em cache e repete em caso de falha; loading e erro ficam na query. Depois de criar, editar ou excluir, a mutation invalida as queries relacionadas.
- A listagem de jogadores faz uma única requisição por filtro. A resposta traz a página e os totais das abas (todos, livres e em clubes) no mesmo `meta`.
- No Compose, o frontend acessa a API pelo proxy do nginx (`/api` → API).
- A aplicação inteira sobe no Docker Compose: Postgres, API e frontend. O Compose de e2e é separado e não entra no `docker compose up` da app.
- Backend: unitários (Vitest, com Prisma e HTTP mockados) e e2e (Supertest contra a API e o Postgres de teste).
- Frontend: unitários (Vitest), de componente (Testing Library) e e2e (Playwright contra a API no Compose de e2e). O e2e usa ambiente próprio (`.env.test`, `docker-compose.e2e.yml`, portas `E2E_*` e `POSTGRES_TEST_*`) e não mexe no stack de desenvolvimento.
- Testes de usecases usando repositorios em memória, focando apenas na lógica.
- Cada requisição da API gera uma linha de log com método, caminho e status, pelo `Logger` do Nest. O filtro global também registra os erros.
- Documentação OpenAPI em `/docs`, com os endpoints da API.
- ESLint e Prettier no frontend (`npm run lint` e `npm run format:check`).

## Funcionalidades não implementadas

Nenhuma.

## Uso de inteligência artificial

Usei o Cursor, com o modelo Grok, para implementar a API, a interface e os testes. Revisei o código e os comandos deste repositório antes de entregá-los.
