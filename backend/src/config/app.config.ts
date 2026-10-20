import { registerAs } from '@nestjs/config';

const DEFAULT_PORT = 3000;
const DEFAULT_RATE_LIMIT_MAX = 300;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;

export const appConfig = registerAs('app', () => {
  const rawPort = process.env.PORT;
  const port =
    rawPort === undefined || rawPort === '' ? DEFAULT_PORT : Number(rawPort);

  return {
    port,
    environment: process.env.NODE_ENV ?? 'development',
    frontendOrigin: process.env.FRONTEND_ORIGIN,
    rateLimit: {
      max: numberOr(process.env.RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
      windowMs: numberOr(
        process.env.RATE_LIMIT_WINDOW_MS,
        DEFAULT_RATE_LIMIT_WINDOW_MS,
      ),
    },
  };
});

function numberOr(raw: string | undefined, fallback: number): number {
  return raw === undefined || raw === '' ? fallback : Number(raw);
}
