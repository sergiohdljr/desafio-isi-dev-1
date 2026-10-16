#!/bin/sh
set -eu

app_url="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
test_url="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres-test:5432/liga_teste"

export DATABASE_URL="${app_url}"
npx prisma migrate deploy --config prisma7.config.ts

DATABASE_URL="${test_url}" npx prisma migrate deploy --config prisma7.config.ts

export DATABASE_URL="${app_url}"
exec node dist/main.js
