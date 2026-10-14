import {
  BadRequestException,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(
    private readonly schema: ZodType<T>,
    private readonly failure: 'bad_request' | 'not_found' = 'bad_request',
  ) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (parsed.success) {
      return parsed.data;
    }

    if (this.failure === 'not_found') {
      throw new NotFoundException('Jogador não encontrado');
    }

    const message = parsed.error.issues
      .map((issue) => issue.message)
      .filter((issue) => issue.length > 0)
      .join('; ');
    throw new BadRequestException(message || 'Dados inválidos');
  }
}
