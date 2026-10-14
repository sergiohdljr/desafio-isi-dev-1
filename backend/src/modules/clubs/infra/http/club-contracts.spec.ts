import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { createClubSchema } from './dto/create-club.schema.js';
import { clubIdSchema } from './input/club-id.schema.js';
import { clubListQuerySchema } from './input/club-list-query.schema.js';

const bodyPipe = new ZodPipe(createClubSchema);
const idPipe = new ZodPipe(clubIdSchema, 'not_found', 'Clube não encontrado');
const queryPipe = new ZodPipe(clubListQuerySchema);

describe('club contracts', () => {
  it('stores a trimmed name and accepts an acronym taken from that name', () => {
    expect(
      bodyPipe.transform({
        name: '  Águias   FC ',
        acronym: 'AFC',
        cash: 10,
        id: 4,
        extra: true,
      }),
    ).toEqual({ name: 'Águias FC', acronym: 'AFC' });
  });

  it('rejects a name or acronym that breaks the format', () => {
    expect(() => bodyPipe.transform({ name: 'FC', acronym: 'AFC' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      bodyPipe.transform({ name: 'Águias FC', acronym: 'afc' }),
    ).toThrow(BadRequestException);
    expect(() =>
      bodyPipe.transform({ name: 'Águias FC', acronym: 'AAA' }),
    ).toThrow(BadRequestException);
    expect(() =>
      bodyPipe.transform({ name: 'Águias FC', acronym: 'FCA' }),
    ).toThrow(BadRequestException);
    expect(() =>
      bodyPipe.transform({ name: 'Águias\tFC', acronym: 'AFC' }),
    ).toThrow(BadRequestException);
    expect(() =>
      bodyPipe.transform({ name: null, acronym: 'AFC' }),
    ).toThrow(BadRequestException);
    expect(() => bodyPipe.transform({ acronym: 'AFC' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a body that is not a JSON object', () => {
    expect(() => bodyPipe.transform([])).toThrow(BadRequestException);
    expect(() => bodyPipe.transform('x')).toThrow(BadRequestException);
    expect(() => bodyPipe.transform(10)).toThrow(BadRequestException);
  });

  it('defaults the list sort to name and ignores an unknown parameter', () => {
    expect(queryPipe.transform({})).toEqual({ sort: 'name' });
    expect(queryPipe.transform({ extra: '1', sort: 'net_worth_desc' })).toEqual({
      sort: 'net_worth_desc',
    });
    expect(queryPipe.transform({ sort: 'net_worth_asc' })).toEqual({
      sort: 'net_worth_asc',
    });
  });

  it('rejects an empty, repeated or unknown club sort', () => {
    for (const sort of ['', 'name,net_worth_asc', 'NAME', 'net_worth_asc ']) {
      expect(() => queryPipe.transform({ sort })).toThrow(BadRequestException);
    }
  });

  it('reads a club id and answers 404 when the format is invalid', () => {
    expect(idPipe.transform('12')).toBe(12);
    expect(() => idPipe.transform('abc')).toThrow(NotFoundException);
    expect(() => idPipe.transform('0')).toThrow(NotFoundException);
    expect(() => idPipe.transform('-1')).toThrow(NotFoundException);
    expect(() => idPipe.transform('1.5')).toThrow(NotFoundException);
    expect(() => idPipe.transform('01')).toThrow(NotFoundException);
    expect(() => idPipe.transform('2147483648')).toThrow(NotFoundException);
  });
});
