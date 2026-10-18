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

Só o `.env` na raiz é necessário para o Compose. Modelo: [.env.example](.env.example).

| Variável | Função |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciais do Postgres |
| `POSTGRES_DB` | Nome do banco da aplicação |
| `POSTGRES_PORT` | Porta do Postgres no host |
| `API_PORT` | Porta da API no host |
| `FRONTEND_ORIGIN` | Origem liberada no CORS (use a URL do frontend) |

Variáveis `POSTGRES_TEST_*` e `E2E_*` servem só aos testes e2e; o `docker compose up` da aplicação não as usa.

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

Se mudar `POSTGRES_TEST_DB` com volume antigo: `docker compose -f docker-compose.e2e.yml down -v`.

## Estrutura

```text
.env.example            Credenciais e portas
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

- Rotas da API em `/api/v1`. Horário em Brasília (`-03:00`).
- Valor de mercado calculado na consulta; valor base só no cadastro.
- Nome de clube único ignora maiúsculas/minúsculas e acento; sigla também única.
- Exclusão de jogador preenche `excluido_em`; a linha permanece.
- Compra/venda e partida gravam o momento; não recalculam depois.
- No Compose, o frontend acessa a API pelo proxy do nginx (`/api` → API).

## Funcionalidades não implementadas

Nenhuma.

## Uso de inteligência artificial

Usei o Cursor, com o modelo Grok, para implementar a API, a interface e os testes. Revisei o código e os comandos deste repositório antes de entregá-los.
