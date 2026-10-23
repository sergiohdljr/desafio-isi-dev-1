# frontend

React, Vite, TypeScript, Tailwind CSS and shadcn/ui.

```bash
npm install
npm run dev
```

## Lint e formatação

```bash
# ESLint (só verifica)
npm run lint

# Prettier (só verifica; não altera arquivos)
npm run format:check
```

## Testes e2e (Playwright)

A suíte usa `docker-compose.e2e.yml` e o `.env.test` da raiz (`E2E_API_PORT`, `E2E_UI_PORT`, `POSTGRES_TEST_*`). Modelo: [`.env.test.example`](../.env.test.example).

| Serviço | Porta |
| --- | --- |
| Postgres de teste | `POSTGRES_TEST_PORT` |
| API (Compose) | `E2E_API_PORT` |
| Vite (Playwright) | `E2E_UI_PORT` |

Não usa o stack de desenvolvimento (5432 / 3000 / 5173). O Playwright carrega o `.env.test`; o Vite encaminha `/api` para a API de e2e.

`npm run test:e2e` e `npm run test:e2e:up` sobem o Compose no host e rodam a suíte na imagem `mcr.microsoft.com/playwright` (mesma versão do `@playwright/test`). O host não precisa de `playwright install`. A primeira execução baixa a imagem. `test:e2e:up` também reconstrói a API.

```bash
npm run test:e2e:up
npm run test:e2e
```

Ao fim da suíte, o script derruba o Compose e2e. Use `E2E_KEEP_UP=1` para manter no ar. `test:e2e:headed`, `test:e2e:debug` e `test:e2e:ui` continuam no host e exigem o Chromium local.

Na raiz do repositório: `npm run compose:e2e`, `compose:e2e:build`, `compose:e2e:down`.

Se mudar credenciais no `.env.test` com volume antigo: `docker compose --env-file .env.test -f docker-compose.e2e.yml down -v`.
