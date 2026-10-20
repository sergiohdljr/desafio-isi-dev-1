import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { closeLeague, openLeague } from '../league-app.js';
import { appOf } from './api.js';

const RATE_LIMIT_MAX = 5;

describe('Proteções de HTTP', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.RATE_LIMIT_MAX = String(RATE_LIMIT_MAX);
    app = await openLeague();
  });

  afterAll(async () => {
    await closeLeague(app);
    delete process.env.RATE_LIMIT_MAX;
  });

  it('responde com os cabeçalhos de segurança do helmet', async () => {
    const response = await appOf(app).get('/api/v1/players').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-ratelimit-limit']).toBe(String(RATE_LIMIT_MAX));
  });

  it('recusa com 429 depois de estourar a janela de requisições', async () => {
    for (let attempt = 0; attempt < RATE_LIMIT_MAX; attempt += 1) {
      await appOf(app).get('/api/v1/clubs');
    }

    const blocked = await appOf(app).get('/api/v1/clubs');
    expect(blocked.status).toBe(429);
  });
});
