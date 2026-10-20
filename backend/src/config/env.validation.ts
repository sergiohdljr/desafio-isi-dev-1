import { z } from 'zod';

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const NON_NEGATIVE_INTEGER = /^(?:0|[1-9]\d*)$/;

function positiveInteger(message: string) {
  return z
    .string(message)
    .regex(POSITIVE_INTEGER, message)
    .transform(Number)
    .optional();
}

/// Timeouts do pool aceitam 0, que no pg significa esperar indefinidamente.
function timeoutInMs(message: string) {
  return z
    .string(message)
    .regex(NON_NEGATIVE_INTEGER, message)
    .transform(Number)
    .optional();
}

const envSchema = z.looseObject({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  PORT: positiveInteger('PORT inválida'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL obrigatória')
    .refine(isPostgresUrl, 'DATABASE_URL deve ser uma URL postgres válida'),
  DATABASE_POOL_MAX: positiveInteger('DATABASE_POOL_MAX inválida'),
  DATABASE_CONNECTION_TIMEOUT_MS: timeoutInMs(
    'DATABASE_CONNECTION_TIMEOUT_MS inválida',
  ),
  DATABASE_IDLE_TIMEOUT_MS: timeoutInMs('DATABASE_IDLE_TIMEOUT_MS inválida'),
  RATE_LIMIT_MAX: positiveInteger('RATE_LIMIT_MAX inválida'),
  RATE_LIMIT_WINDOW_MS: positiveInteger('RATE_LIMIT_WINDOW_MS inválida'),
  FRONTEND_ORIGIN: z.url('FRONTEND_ORIGIN inválida'),
});

function isPostgresUrl(value: string): boolean {
  try {
    const { protocol, hostname } = new URL(value);
    return (
      (protocol === 'postgresql:' || protocol === 'postgres:') &&
      hostname.length > 0
    );
  } catch {
    return false;
  }
}

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join('; ');
    throw new Error(message || 'Ambiente inválido');
  }

  return parsed.data;
}
