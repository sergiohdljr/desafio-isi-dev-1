# Backend

API NestJS. A subida avaliada é o Compose da raiz, não este diretório sozinho. Ver [README.md](../README.md).

No host (testes, lint, `db:clean`, `db:reset`): Node.js 22, `npm ci` a partir do `package-lock.json`, com o `.env` da raiz já criado. Esses scripts exigem o Postgres do Compose no ar e a API parada.

```bash
npm ci
npm test
npm run test:e2e
npm run lint
npm run format:check
```

`npm run test:e2e` sobe o Postgres de teste pelo `docker-compose.e2e.yml` se precisar. Credenciais em `.env.test` na raiz.
