import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPostgresUrl } from '../src/config/postgres-url.js';

function testEnvPath(): string {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(testDir, '../../.env.test');
}

export function loadTestEnv(): void {
  const envPath = testEnvPath();
  if (!existsSync(envPath)) {
    throw new Error(
      'Crie .env.test na raiz a partir de .env.test.example. O e2e usa só esse arquivo.',
    );
  }

  config({ path: envPath, override: true });

  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const port = process.env.POSTGRES_TEST_PORT;
  const database = process.env.POSTGRES_TEST_DB;
  if (!user || !password) {
    throw new Error(
      'POSTGRES_USER e POSTGRES_PASSWORD são obrigatórios no .env.test.',
    );
  }
  if (!port || !database) {
    throw new Error(
      'POSTGRES_TEST_PORT e POSTGRES_TEST_DB são obrigatórios no .env.test.',
    );
  }

  const uiPort = process.env.E2E_UI_PORT;
  if (!uiPort) {
    throw new Error('E2E_UI_PORT é obrigatório no .env.test.');
  }

  process.env.DATABASE_URL = buildPostgresUrl({
    user,
    password,
    host: 'localhost',
    port,
    database,
  });
  process.env.FRONTEND_ORIGIN = `http://127.0.0.1:${uiPort}`;
  process.env.NODE_ENV = 'test';
}
