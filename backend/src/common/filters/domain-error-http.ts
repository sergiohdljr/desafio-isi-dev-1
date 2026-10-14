import { HttpStatus } from '@nestjs/common';
import { DomainErrorKind } from '../../shared/domain/domain-error.js';

export function httpStatusForDomainError(kind: DomainErrorKind): number {
  if (kind === 'missing') {
    return HttpStatus.NOT_FOUND;
  }
  if (kind === 'conflict') {
    return HttpStatus.CONFLICT;
  }
  return HttpStatus.BAD_REQUEST;
}
