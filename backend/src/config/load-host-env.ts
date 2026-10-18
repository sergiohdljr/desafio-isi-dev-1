import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPostgresUrl } from './postgres-url.js';

const DEFAULT_APP_PORT = '5432';
const PLACEHOLDER_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';

export type LoadHostEnvOptions = {
  /** Usado no `prisma generate` (build Docker) quando não há `.env`. */
  allowPlaceholder?: boolean;
};

function repoPaths() {
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const backendRoot = path.resolve(configDir, '../..');
  const repoRoot = path.resolve(backendRoot, '..');
  return {
    rootEnvPath: path.join(repoRoot, '.env'),
    backendEnvPath: path.join(backendRoot, '.env'),
  };
}

/**
 * Carrega `.env` da raiz (credenciais) e `backend/.env` (PORT).
 * No host, monta DATABASE_URL a partir de POSTGRES_*.
 * No container (POSTGRES_HOST definido pelo Compose), não altera a URL do entrypoint.
 */
export function loadHostEnv(options: LoadHostEnvOptions = {}): void {
  const { rootEnvPath, backendEnvPath } = repoPaths();

  if (existsSync(rootEnvPath)) {
    config({ path: rootEnvPath });
  }

  if (existsSync(backendEnvPath)) {
    config({ path: backendEnvPath, override: true });
  }

  if (!process.env.PORT && process.env.API_PORT) {
    process.env.PORT = process.env.API_PORT;
  }

  if (process.env.POSTGRES_HOST) {
    return;
  }

  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  if (!user || !password || !database) {
    if (process.env.DATABASE_URL) {
      return;
    }
    if (options.allowPlaceholder) {
      process.env.DATABASE_URL = PLACEHOLDER_URL;
      return;
    }
    throw new Error(
      'Crie .env na raiz a partir de .env.example (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB).',
    );
  }

  const port = process.env.POSTGRES_PORT ?? DEFAULT_APP_PORT;
  process.env.DATABASE_URL = buildPostgresUrl({
    user,
    password,
    host: 'localhost',
    port,
    database,
  });
}
