export type DomainErrorKind = 'invalid' | 'missing' | 'conflict';

export class DomainError extends Error {
  constructor(
    readonly kind: DomainErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
