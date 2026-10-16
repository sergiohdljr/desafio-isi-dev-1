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

Os comandos rodam na pasta `backend`. O banco criado fica vazio: sem jogadores, clubes, transações nem partidas.

Criar:

```bash
cd backend
cp .env.example .env
docker compose up -d postgres
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

Ubuntu 24.04, com Docker disponível. Um comando por linha.

```bash
cd backend
cp .env.example .env
docker compose up -d postgres
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

O modelo versionado é [backend/.env.example](backend/.env.example). Copie para `backend/.env`.

| Variável | Função |
| --- | --- |
| `POSTGRES_USER` | Usuário do Postgres no Compose |
| `POSTGRES_PASSWORD` | Senha do Postgres no Compose |
| `POSTGRES_DB` | Nome do banco da aplicação |
| `POSTGRES_PORT` | Porta publicada no host |
| `DATABASE_URL` | URL que o Prisma e a API usam. Usuário, senha, porta e banco precisam coincidir com as variáveis acima |

O frontend não usa variável de ambiente.

O e2e da API usa outro banco, na porta 5433. O modelo é [backend/.env.test.example](backend/.env.test.example). Não é necessário para subir a aplicação.

## 5. Estrutura de pastas

```text
backend/     API NestJS, Prisma e Compose do Postgres
frontend/    Interface React
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
