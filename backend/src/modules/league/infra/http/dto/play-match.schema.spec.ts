import { BadRequestException } from '@nestjs/common';
import { ZodPipe } from '../../../../../common/validation/zod-pipe.js';
import { playMatchSchema } from './play-match.schema.js';

const pipe = new ZodPipe(playMatchSchema);

describe('play match contract', () => {
  it('reads two different clubs', () => {
    expect(pipe.transform({ home_club_id: 1, away_club_id: 2 })).toEqual({
      homeClubId: 1,
      awayClubId: 2,
    });
  });

  it('rejects the same club on both sides and an invalid id', () => {
    expect(() =>
      pipe.transform({ home_club_id: 1, away_club_id: 1 }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({ home_club_id: 0, away_club_id: 2 }),
    ).toThrow(BadRequestException);
  });
});
