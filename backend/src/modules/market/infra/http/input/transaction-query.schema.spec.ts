import { BadRequestException } from '@nestjs/common';
import { ZodPipe } from '../../../../../common/validation/zod-pipe.js';
import { transactionQuerySchema } from './transaction-query.schema.js';

const pipe = new ZodPipe(transactionQuerySchema);

describe('transaction query', () => {
  it('reads one or both types and a player, and ignores an unknown parameter', () => {
    expect(pipe.transform({ extra: '1' })).toEqual({
      types: undefined,
      playerId: undefined,
    });
    expect(pipe.transform({ type: 'VENDA' })).toEqual({
      types: ['VENDA'],
      playerId: undefined,
    });
    expect(pipe.transform({ type: 'COMPRA,VENDA', player_id: '12' })).toEqual({
      types: ['COMPRA', 'VENDA'],
      playerId: 12,
    });
  });

  it('rejects an empty, repeated, spaced or lowercase type and a bad player id', () => {
    expect(() => pipe.transform({ type: '' })).toThrow(BadRequestException);
    expect(() => pipe.transform({ type: 'venda' })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ type: 'COMPRA,COMPRA' })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ type: 'COMPRA, VENDA' })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ player_id: '01' })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ player_id: '0' })).toThrow(
      BadRequestException,
    );
  });
});
