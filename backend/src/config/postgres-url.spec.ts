import { describe, expect, it } from 'vitest';
import { buildPostgresUrl } from './postgres-url.js';

describe('buildPostgresUrl', () => {
  it('monta a URL com user e senha codificados', () => {
    const url = buildPostgresUrl({
      user: 'sergio.lima',
      password: 'p@ss/w:rd',
      host: 'localhost',
      port: '5432',
      database: 'backend',
    });

    expect(url).toBe(
      'postgresql://sergio.lima:p%40ss%2Fw%3Ard@localhost:5432/backend',
    );
  });
});
