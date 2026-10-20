import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { ConfigService } from '@nestjs/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { mountDocs } from './docs/mount-docs.js';

export function configureApp(app: NestFastifyApplication): void {
  const config = app.get(ConfigService);

  void app.register(fastifyHelmet, {
    // A API responde JSON e a página de docs carrega os assets do Scalar por CDN.
    contentSecurityPolicy: false,
  });
  void app.register(fastifyRateLimit, {
    max: config.getOrThrow<number>('app.rateLimit.max'),
    timeWindow: config.getOrThrow<number>('app.rateLimit.windowMs'),
  });

  app.enableCors({
    origin: config.getOrThrow<string>('app.frontendOrigin'),
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  mountDocs(app);
}
