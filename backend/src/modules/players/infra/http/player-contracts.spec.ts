import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { createPlayerSchema } from './dto/create-player.schema.js';
import { playerIdSchema } from './input/player-id.schema.js';
import { playerListQuerySchema } from './input/player-list-query.schema.js';

const bodyPipe = new ZodPipe(createPlayerSchema);
const queryPipe = new ZodPipe(playerListQuerySchema);
const idPipe = new ZodPipe(playerIdSchema, 'not_found');

const player = {
  name: 'Meia Zeta',
  position: 'MEI',
  agility: 50,
  age: 25,
  pace: 60,
  shooting: 60,
  passing: 60,
  dribbling: 60,
  defending: 60,
  physical: 60,
  potential: 70,
};

describe('player contracts', () => {
  it('normalizes the name and ignores an unknown field', () => {
    const parsed = bodyPipe.transform({
      ...player,
      name: '  Meia   Zeta  ',
      agility: 50.0,
      club_id: 9,
    });

    expect(parsed.name).toBe('Meia Zeta');
    expect(parsed.agility).toBe(50);
    expect(parsed).not.toHaveProperty('club_id');
  });

  it('rejects a name that is too short or contains a digit', () => {
    expect(() => bodyPipe.transform({ ...player, name: 'Ana' })).toThrow(
      BadRequestException,
    );
    expect(() => bodyPipe.transform({ ...player, name: 'Ana 2 Lima' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a body that is not a JSON object and a string used as a number', () => {
    expect(() => bodyPipe.transform([])).toThrow(BadRequestException);
    expect(() => bodyPipe.transform('x')).toThrow(BadRequestException);
    expect(() => bodyPipe.transform(10)).toThrow(BadRequestException);
    expect(() => bodyPipe.transform(null)).toThrow(BadRequestException);
    expect(() => bodyPipe.transform({ ...player, age: '15' })).toThrow(
      BadRequestException,
    );
    expect(() => bodyPipe.transform({ ...player, age: 25.5 })).toThrow(
      BadRequestException,
    );
  });

  it('reads a player id and answers 404 when the format is invalid', () => {
    expect(idPipe.transform('12')).toBe(12);
    expect(() => idPipe.transform('01')).toThrow(NotFoundException);
    expect(() => idPipe.transform('0')).toThrow(NotFoundException);
    expect(() => idPipe.transform('2147483648')).toThrow(NotFoundException);
    expect(() => idPipe.transform('1.5')).toThrow(NotFoundException);
  });

  it('applies query defaults and ignores an unknown parameter', () => {
    expect(queryPipe.transform({ extra: '1' })).toEqual({
      search: undefined,
      position: undefined,
      condition: undefined,
      free: undefined,
      clubId: undefined,
      minAge: undefined,
      maxAge: undefined,
      minValue: undefined,
      maxValue: undefined,
      sorts: ['name'],
      page: 1,
      limit: 10,
    });
  });

  it('rejects an empty filter, a reversed range, a repeated sort field and free with a club', () => {
    expect(() => queryPipe.transform({ position: '' })).toThrow(
      BadRequestException,
    );
    expect(() => queryPipe.transform({ min_age: '30', max_age: '20' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      queryPipe.transform({ min_value: '10.5', max_value: '10' }),
    ).toThrow(BadRequestException);
    expect(() => queryPipe.transform({ sort: 'value_asc,value_desc' })).toThrow(
      BadRequestException,
    );
    expect(() => queryPipe.transform({ sort: 'name,value_asc' })).not.toThrow();
    expect(() => queryPipe.transform({ free: 'true', club_id: '4' })).toThrow(
      BadRequestException,
    );
  });
});
