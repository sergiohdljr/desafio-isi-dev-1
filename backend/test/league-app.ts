import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { emptyLeague } from './empty-league.js';

export async function openLeague(): Promise<NestFastifyApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  configureApp(app);
  app.useLogger(false);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

export async function resetLeague(app: NestFastifyApplication): Promise<void> {
  await emptyLeague(app.get(PrismaService));
}

export async function closeLeague(app: NestFastifyApplication): Promise<void> {
  await app.close();
}
