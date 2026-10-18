import { ConfigService } from '@nestjs/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { mountDocs } from './docs/mount-docs.js';

export function configureApp(app: NestFastifyApplication): void {
  const frontendOrigin = app
    .get(ConfigService)
    .getOrThrow<string>('app.frontendOrigin');

  app.enableCors({
    origin: frontendOrigin,
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  mountDocs(app);
}
