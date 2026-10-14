import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('answers the API root as an unknown path', async () => {
    const unknown = await request(app.getHttpServer())
      .get('/api/v1/caminho-inexistente')
      .expect(404)
      .expect('Content-Type', /application\/json/);

    const root = await request(app.getHttpServer())
      .get('/api/v1')
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(typeof root.body.message).toBe('string');
    expect(root.body.message.length).toBeGreaterThan(0);
    expect(root.body.statusCode).toBe(unknown.body.statusCode);
    expect(JSON.stringify(root.body)).not.toContain('Hello World');
    expect(JSON.stringify(root.body)).not.toContain('stack');
  });

  afterEach(async () => {
    await app.close();
  });
});
