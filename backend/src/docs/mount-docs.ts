import fastifyApiReference from '@scalar/fastify-api-reference';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { openApiDocument } from './openapi-document.js';

export function mountDocs(app: NestFastifyApplication): void {
  const fastify = app.getHttpAdapter().getInstance();
  fastify.get('/docs/openapi.json', () => openApiDocument);
  void fastify.register(fastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      url: '/docs/openapi.json',
      pageTitle: 'Liga',
    },
  });
}
