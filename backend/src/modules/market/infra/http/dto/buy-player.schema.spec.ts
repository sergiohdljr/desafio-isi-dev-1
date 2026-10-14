import { BadRequestException } from '@nestjs/common';
import { ZodPipe } from '../../../../../common/validation/zod-pipe.js';
import { buyPlayerSchema } from './buy-player.schema.js';

const pipe = new ZodPipe(buyPlayerSchema);

describe('buy player contract', () => {
  it('reads the club and the loyalty minute and ignores an unknown field', () => {
    const parsed = pipe.transform({
      club_id: 4,
      loyalty_until: '2027-03-02T10:15-03:00',
      cash: 10,
    });

    expect(parsed.clubId).toBe(4);
    expect(parsed.loyaltyUntil.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('rejects a missing field, a bad club id and a loyalty that is not the Brasília minute', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({
        club_id: 0,
        loyalty_until: '2027-03-02T10:15-03:00',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({
        club_id: '4',
        loyalty_until: '2027-03-02T10:15-03:00',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({
        club_id: 4,
        loyalty_until: '2027-02-30T10:15-03:00',
      }),
    ).toThrow(BadRequestException);
    expect(() => pipe.transform([])).toThrow(BadRequestException);
  });
});
