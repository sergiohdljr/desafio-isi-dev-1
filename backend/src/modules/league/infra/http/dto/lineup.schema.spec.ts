import { BadRequestException } from '@nestjs/common';
import { ZodPipe } from '../../../../../common/validation/zod-pipe.js';
import { lineupSchema } from './lineup.schema.js';

const pipe = new ZodPipe(lineupSchema);

describe('lineup contract', () => {
  it('reads the formation and the five distinct starters', () => {
    expect(
      pipe.transform({ formation: '2-2', player_ids: [1, 2, 3, 4, 5] }),
    ).toEqual({ formation: '2-2', playerIds: [1, 2, 3, 4, 5] });
  });

  it('rejects a bad formation, the wrong count and a repeated starter', () => {
    expect(() =>
      pipe.transform({ formation: '4-4-2', player_ids: [1, 2, 3, 4, 5] }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({ formation: '2-2', player_ids: [1, 2, 3, 4] }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({ formation: '2-2', player_ids: [1, 1, 3, 4, 5] }),
    ).toThrow(BadRequestException);
  });
});
