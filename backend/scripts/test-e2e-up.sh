#!/usr/bin/env bash
set -euo pipefail

backend="$(cd "$(dirname "$0")/.." && pwd)"
root="$(cd "${backend}/.." && pwd)"

if [[ ! -f "${backend}/.env.test" ]]; then
  echo "Crie backend/.env.test a partir de .env.test.example." >&2
  exit 1
fi

database_url="$(grep -E '^DATABASE_URL=' "${backend}/.env.test" | head -n 1 | cut -d= -f2- | tr -d '"')"
if [[ "${database_url}" != *localhost:5433/liga_teste ]]; then
  echo "DATABASE_URL do e2e precisa apontar para localhost:5433/liga_teste." >&2
  exit 1
fi

docker compose -f "${root}/docker-compose.yml" --project-directory "${root}" up -d --wait postgres-test

cd "${backend}"
npm run test:e2e
