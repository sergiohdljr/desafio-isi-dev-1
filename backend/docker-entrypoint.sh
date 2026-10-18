#!/bin/sh
set -eu

host="${POSTGRES_HOST:-postgres}"
db="${POSTGRES_DB:?POSTGRES_DB obrigatória}"
: "${POSTGRES_USER:?POSTGRES_USER obrigatória}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD obrigatória}"

export POSTGRES_HOST="${host}"
export POSTGRES_DB="${db}"
export DATABASE_URL="$(
  node -e "
    const user = encodeURIComponent(process.env.POSTGRES_USER);
    const password = encodeURIComponent(process.env.POSTGRES_PASSWORD);
    const host = process.env.POSTGRES_HOST;
    const database = process.env.POSTGRES_DB;
    process.stdout.write('postgresql://' + user + ':' + password + '@' + host + ':5432/' + database);
  "
)"

npx prisma migrate deploy --config prisma7.config.ts
exec node dist/main.js
