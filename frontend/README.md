# Frontend

React e Vite. A subida avaliada é o Compose da raiz: nginx na porta 5173 do host, proxy `/api` para a API. Ver [README.md](../README.md).

`npm run dev` é o Vite de desenvolvimento, também na porta 5173. Não rode junto com o frontend do Compose.

No host: Node.js 22 e `npm ci`.

```bash
npm ci
npm test
npm run lint
npm run format:check
npm run test:e2e:up
```

O e2e usa `docker-compose.e2e.yml` e `.env.test` na raiz (`E2E_API_PORT`, `E2E_UI_PORT`, `POSTGRES_TEST_*`). Não usa as portas 5432, 3000 e 5173. O Playwright roda na imagem `mcr.microsoft.com/playwright`; o host não precisa de `playwright install`. Ao fim, o script derruba o Compose de e2e. `E2E_KEEP_UP=1` mantém os serviços no ar.

`test:e2e:headed`, `test:e2e:debug` e `test:e2e:ui` rodam no host e exigem Chromium local.
