import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { mountDocs } from './docs/mount-docs.js';

export function configureApp(app: NestFastifyApplication): void {
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  mountDocs(app);
}
