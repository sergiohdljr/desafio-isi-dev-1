import { z } from 'zod';

const envSchema = z.looseObject({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  PORT: z
    .string()
    .regex(/^[1-9]\d*$/, 'PORT inválida')
    .transform(Number)
    .optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL obrigatória'),
});

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
