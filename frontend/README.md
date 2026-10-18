# frontend

React, Vite, TypeScript, Tailwind CSS and shadcn/ui.

```bash
npm install
npm run dev
```

## Testes e2e (Playwright)

A suíte usa `docker-compose.e2e.yml` e o `.env` da raiz (`E2E_API_PORT`, `E2E_UI_PORT`, `POSTGRES_TEST_*`).

| Serviço | Porta |
| --- | --- |
| Postgres de teste | `POSTGRES_TEST_PORT` |
| API (Compose) | `E2E_API_PORT` |
| Vite (Playwright) | `E2E_UI_PORT` |

Não usa o stack de desenvolvimento (5432 / 3000 / 5173). O Playwright carrega o `.env` da raiz; o Vite encaminha `/api` para a API de e2e.

```bash
# rebuild da API no Compose e roda a suíte
npm run test:e2e:up

# sobe o Compose se precisar e roda a suíte
npm run test:e2e
```

Na raiz do repositório: `npm run compose:e2e`, `compose:e2e:build`, `compose:e2e:down`.
