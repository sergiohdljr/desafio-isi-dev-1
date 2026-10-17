import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { logRequests } from './common/http/log-requests.js';
import { configureApp } from './configure-app.js';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: isProduction
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );
  configureApp(app);
  logRequests(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('app.port'), '0.0.0.0');
}
await bootstrap();
