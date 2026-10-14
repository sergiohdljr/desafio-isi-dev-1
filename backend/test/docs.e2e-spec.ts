import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';

describe('API reference', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    app.useLogger(false);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the reference page and the OpenAPI document outside the API prefix', async () => {
    const page = await request(app.getHttpServer()).get('/docs').redirects(1);
    expect(page.status).toBe(200);
    expect(page.headers['content-type']).toContain('text/html');

    const document = await request(app.getHttpServer())
      .get('/docs/openapi.json')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(document.body.paths).toHaveProperty('/api/v1/players');
    expect(document.body.paths).toHaveProperty('/api/v1/standings');

    const players = await request(app.getHttpServer())
      .get('/api/v1/players')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(players.body).toHaveProperty('data');
    expect(players.body).toHaveProperty('meta');
  });
});
