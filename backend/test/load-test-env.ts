import { config } from 'dotenv';
import { existsSync } from 'node:fs';

const envFile = '.env.test';

export function loadTestEnv(): void {
  if (!existsSync(envFile)) {
    throw new Error(
      'Crie backend/.env.test a partir de .env.test.example. O e2e usa o banco liga_teste.',
    );
  }

  config({ path: envFile, override: true });
  process.env.NODE_ENV = 'test';

  const url = process.env.DATABASE_URL ?? '';
  if (!url.endsWith(':5433/liga_teste')) {
    throw new Error(
      'DATABASE_URL do e2e precisa apontar para a porta 5433 e o banco liga_teste.',
    );
  }
}
