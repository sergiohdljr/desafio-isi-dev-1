# Liga

API em `http://localhost:3000` e frontend em `http://localhost:5173`. O prefixo `/api/v1` não faz parte da origem da API.

Detalhes de cada pasta: [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).

## 1. Pré-requisitos

Instale só estes runtimes. O PostgreSQL sobe pelo Docker, no passo 3.

| Ferramenta | Versão |
| --- | --- |
| Node.js | 22 |
| npm | o que acompanha o Node.js 22 |
| Docker | com Docker Compose, no Ubuntu 24.04 |

A imagem do banco é `postgres:17-alpine`, pública.

## 2. Banco de dados

Os comandos de migration rodam na pasta `backend`. O Compose fica na raiz. O banco criado fica vazio: sem jogadores, clubes, transações nem partidas.

Criar:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d postgres
cd backend
npm ci
npx prisma migrate deploy
```

Recriar do zero (apaga o schema e aplica as migrations de novo):

```bash
cd backend
npx prisma migrate reset --force
```

O Postgres precisa estar no ar. Esse comando não carrega dados de exemplo.

Dados de exemplo, opcional, com a API parada:

```bash
cd backend
npm run db:reset
```

## 3. Instalar e executar

Ubuntu 24.04, com Docker disponível.

Tudo de uma vez, na raiz do repositório. Sobe o banco da aplicação (porta 5432), a API e o frontend. A API aplica as migrations no banco da aplicação ao iniciar.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up --build
```

A API fica em `http://localhost:3000`. O frontend fica em `http://localhost:5173`.

O stack de e2e fica em `docker-compose.e2e.yml`. Na raiz: `npm run compose:e2e` / `compose:e2e:build` / `compose:e2e:down`. Não faz parte deste `docker compose up`.

Para desenvolver na máquina, sem a imagem da API e do frontend:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d postgres
cd backend
npm ci
npx prisma migrate deploy
npm run start:dev
```

A API fica em `http://localhost:3000`.

Em outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

O frontend fica em `http://localhost:5173`. As chamadas a `/api` são encaminhadas para `http://127.0.0.1:3000`.

## 4. Variáveis de ambiente

A fonte de verdade é o `.env` da raiz ([.env.example](.env.example)). Copie também `backend/.env.example` → `backend/.env` se quiser só ajustar a `PORT` da API no host.

| Arquivo | Modelo | Função |
| --- | --- | --- |
| `.env` (raiz) | [.env.example](.env.example) | Postgres, portas do app e do e2e (Compose + loaders) |
| `backend/.env` | [backend/.env.example](backend/.env.example) | Opcional: `PORT` da API no host |

| Variável | Função |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciais do Postgres |
| `POSTGRES_DB` | Banco da aplicação |
| `POSTGRES_PORT` | Porta do Postgres da app no host |
| `API_PORT` | Porta da API da app no Compose / fallback da API no host |
| `FRONTEND_ORIGIN` | Origem do frontend permitida no CORS da API |
| `POSTGRES_TEST_DB` | Banco de e2e |
| `POSTGRES_TEST_PORT` | Porta do Postgres de e2e no host |
| `E2E_API_PORT` | Porta da API de e2e |
| `E2E_UI_PORT` | Porta do Vite nos testes Playwright |

No host, a API e o Prisma montam `DATABASE_URL` a partir de `POSTGRES_*` da raiz (`localhost` + `POSTGRES_PORT` + `POSTGRES_DB`). Não é preciso repetir user/senha em `backend/.env`.

Nos containers, o `docker-entrypoint.sh` monta a URL com encode (user/senha) e `POSTGRES_HOST` (`postgres` ou `postgres-test`). O frontend de desenvolvimento não usa `.env`; o Playwright lê o `.env` da raiz.

Se mudar `POSTGRES_TEST_DB` com volume antigo, recrie o volume: `npm run compose:e2e:down` e `docker compose -f docker-compose.e2e.yml down -v`.

No frontend: `npm run test:e2e:up` (rebuild + Playwright) ou `npm run test:e2e`. No backend: `npm run test:e2e`.

## 5. Estrutura de pastas

```text
.env.example            Credenciais e portas (Compose app/e2e)
package.json            Scripts compose:e2e*
docker-compose.yml      App: Postgres, API e frontend
docker-compose.e2e.yml  E2e: Postgres de teste e API
backend/                API NestJS e Prisma
frontend/               Interface React
```

Dentro de `backend/src`: `modules/` (jogadores, clubes, mercado e liga), `prisma/` e `config/`. As migrations ficam em `backend/prisma/migrations`.

Dentro de `frontend/src`: `features/` (telas por área), `components/` e `app/`.

### Bibliotecas

Backend:

| Biblioteca | Motivo |
| --- | --- |
| NestJS (`@nestjs/common`, `core`, `config`, `platform-fastify`) | Organizar a API em módulos e servir HTTP com Fastify |
| Prisma (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) | Schema, migrations e acesso ao PostgreSQL |
| Zod | Validar o corpo e a query de cada rota |
| RxJS | Dependência do NestJS para os fluxos internos |
| `reflect-metadata` | Metadados dos decorators do NestJS |
| `@scalar/fastify-api-reference` | Página de referência da API |
| Vitest, Supertest | Testes de unidade e de ponta a ponta |
| TypeScript | Tipar o código da API |

Frontend:

| Biblioteca | Motivo |
| --- | --- |
| React e React DOM | Interface |
| Vite (`vite`, `@vitejs/plugin-react`) | Servidor de desenvolvimento e build |
| React Router | Navegação entre as telas |
| TanStack Query | Buscar e atualizar os dados da API |
| Axios | Chamadas HTTP |
| Tailwind CSS (`tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`) | Estilo |
| shadcn, Base UI, `class-variance-authority`, `cn` | Componentes de interface |
| Lucide | Ícones |
| Geist (`@fontsource-variable/geist`) | Fonte |
| TypeScript | Tipar o código da interface |
| Vitest e Playwright | Testes de unidade e de navegador |

## 6. Decisões e premissas

- A origem da API é `http://localhost:3000`. As rotas ficam em `/api/v1`.
- O horário de fidelidade e das respostas é o de Brasília, com offset `-03:00`.
- O valor de mercado é calculado na consulta. O valor base é gravado só no cadastro.
- Nome de clube único ignora maiúsculas e minúsculas e considera acento. A sigla também é única.
- A exclusão de jogador preenche `excluido_em`. A linha permanece no banco.
- Compra e venda gravam contrato, caixa e transação na mesma operação do banco.
- Partida, duelos e transação guardam os dados do momento e não são recalculados depois.
- O frontend fala com a API pelo proxy do Vite. Não há arquivo `.env` no frontend.

## 7. Funcionalidades não implementadas

Nenhuma.

## 8. Uso de inteligência artificial

Usei o Cursor, com o modelo Grok, para implementar a API, a interface e os testes. Revisei o código e os comandos deste repositório antes de entregá-los.
