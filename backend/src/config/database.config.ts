import { registerAs } from '@nestjs/config';

const DEFAULT_POOL_MAX = 10;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_IDLE_TIMEOUT_MS = 30_000;

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  poolMax: numberOr(process.env.DATABASE_POOL_MAX, DEFAULT_POOL_MAX),
  connectionTimeoutMs: numberOr(
    process.env.DATABASE_CONNECTION_TIMEOUT_MS,
    DEFAULT_CONNECTION_TIMEOUT_MS,
  ),
  idleTimeoutMs: numberOr(
    process.env.DATABASE_IDLE_TIMEOUT_MS,
    DEFAULT_IDLE_TIMEOUT_MS,
  ),
}));

function numberOr(raw: string | undefined, fallback: number): number {
  return raw === undefined || raw === '' ? fallback : Number(raw);
}
