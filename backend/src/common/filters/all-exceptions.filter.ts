import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '../../shared/domain/domain-error.js';
import { httpStatusForDomainError } from './domain-error-http.js';

/// Plugins do Fastify (rate limit, por exemplo) lançam erros com statusCode em vez
/// de HttpException. Só 4xx é repassado; 5xx não revela mensagem interna.
function clientErrorOf(
  exception: unknown,
): { status: number; message: string } | undefined {
  if (typeof exception !== 'object' || exception === null) {
    return undefined;
  }
  const candidate = exception as { statusCode?: unknown; message?: unknown };
  if (
    typeof candidate.statusCode !== 'number' ||
    candidate.statusCode < HttpStatus.BAD_REQUEST ||
    candidate.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    return undefined;
  }

  return {
    status: candidate.statusCode,
    message:
      typeof candidate.message === 'string'
        ? candidate.message
        : 'Request error',
  };
}

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const domainError =
      exception instanceof DomainError ? exception : undefined;
    const clientError = clientErrorOf(exception);
    const status = domainError
      ? httpStatusForDomainError(domainError.kind)
      : exception instanceof HttpException
        ? exception.getStatus()
        : (clientError?.status ?? HttpStatus.INTERNAL_SERVER_ERROR);

    if (!domainError && status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const exceptionBody =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = domainError
      ? domainError.message
      : typeof exceptionBody === 'string'
        ? exceptionBody
        : exceptionBody &&
            typeof exceptionBody === 'object' &&
            'message' in exceptionBody
          ? exceptionBody.message
          : (clientError?.message ?? 'Internal server error');

    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
