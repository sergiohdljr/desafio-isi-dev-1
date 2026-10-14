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
    const status = domainError
      ? httpStatusForDomainError(domainError.kind)
      : exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      !domainError &&
      (!(exception instanceof HttpException) || status >= 500)
    ) {
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
          : 'Internal server error';

    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
