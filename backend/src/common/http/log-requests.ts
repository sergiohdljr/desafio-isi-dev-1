import { Logger } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

export function logRequests(app: NestFastifyApplication): void {
  const logger = new Logger('HTTP');
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onResponse', (request, reply, done) => {
      logger.log(requestLine(request.method, request.url, reply.statusCode));
      done();
    });
}

function requestLine(method: string, url: string, status: number): string {
  const verb = paint(methodColor(method), method.padEnd(6));
  const code = paint(statusColor(status), String(status));
  return `${verb} ${url} ${code}`;
}

function methodColor(method: string): number {
  switch (method) {
    case 'GET':
      return 36;
    case 'POST':
      return 32;
    case 'PUT':
    case 'PATCH':
      return 33;
    case 'DELETE':
      return 31;
    default:
      return 37;
  }
}

function statusColor(status: number): number {
  if (status >= 500) {
    return 31;
  }
  if (status >= 400) {
    return 33;
  }
  if (status >= 300) {
    return 36;
  }
  return 32;
}

function paint(code: number, text: string): string {
  if (process.env.NO_COLOR !== undefined) {
    return text;
  }
  return `\u001b[${code}m${text}\u001b[0m`;
}
