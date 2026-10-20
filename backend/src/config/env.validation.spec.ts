import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/liga',
  FRONTEND_ORIGIN: 'http://localhost:5173',
};

describe('validateEnv', () => {
  it('aceita o ambiente mínimo e assume development', () => {
    expect(validateEnv({ ...validEnv }).NODE_ENV).toBe('development');
  });

  it('recusa DATABASE_URL que não é postgres', () => {
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_URL: 'mysql://user@localhost/liga' }),
    ).toThrow('DATABASE_URL deve ser uma URL postgres válida');
  });

  it('recusa limites de requisição não numéricos ou zerados', () => {
    expect(() =>
      validateEnv({ ...validEnv, RATE_LIMIT_MAX: 'muitas' }),
    ).toThrow('RATE_LIMIT_MAX inválida');
    expect(() => validateEnv({ ...validEnv, RATE_LIMIT_MAX: '0' })).toThrow(
      'RATE_LIMIT_MAX inválida',
    );
    expect(() =>
      validateEnv({ ...validEnv, RATE_LIMIT_WINDOW_MS: '-1' }),
    ).toThrow('RATE_LIMIT_WINDOW_MS inválida');
  });

  it('recusa pool inválido mas aceita timeout zero, que no pg é esperar sempre', () => {
    expect(() => validateEnv({ ...validEnv, DATABASE_POOL_MAX: '0' })).toThrow(
      'DATABASE_POOL_MAX inválida',
    );
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_IDLE_TIMEOUT_MS: '0' }),
    ).not.toThrow();
  });
});
