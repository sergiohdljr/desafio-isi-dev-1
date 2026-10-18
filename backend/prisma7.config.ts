import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const backendRoot = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(backendRoot, '../.env');
const backendEnvPath = path.join(backendRoot, '.env');
const placeholderUrl = 'postgresql://postgres:postgres@localhost:5432/postgres';

if (existsSync(rootEnvPath)) {
  config({ path: rootEnvPath });
}
if (existsSync(backendEnvPath)) {
  config({ path: backendEnvPath, override: true });
}

if (!process.env.POSTGRES_HOST) {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  const port = process.env.POSTGRES_PORT ?? '5432';
  if (user && password && database) {
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@localhost:${port}/${database}`;
  }
}

process.env.DATABASE_URL ??= placeholderUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
