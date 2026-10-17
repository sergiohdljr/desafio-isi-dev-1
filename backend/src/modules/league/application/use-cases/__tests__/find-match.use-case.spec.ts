import { Test } from '@nestjs/testing';
import {
  LEAGUE_REPOSITORY,
  type SavedMatch,
} from '../../repositories/league-repository.js';
import { InMemoryLeagueRepository } from '../../../infra/repositories/in-memory-league-repository.js';
import { FindMatch } from '../match.use-case.js';

const played: SavedMatch = {
  id: 4,
  playedAt: new Date('2027-04-01T15:00:00.000Z'),
  homeClubId: 1,
  awayClubId: 2,
  homeName: 'Alpha FC',
  awayName: 'Beta FC',
  homeFormation: '2-2',
  awayFormation: '2-2',
  homeGoals: 2,
  awayGoals: 0,
  result: 'MANDANTE',
  duels: [],
};

describe('find match', () => {
  it('returns the stored match', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindMatch,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository([played]),
        },
      ],
    }).compile();

    const match = await module.get(FindMatch).execute(4);
    expect(match.homeGoals).toBe(2);
    expect(match.awayName).toBe('Beta FC');
  });

  it('answers that a missing match does not exist', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindMatch,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository(),
        },
      ],
    }).compile();

    await expect(module.get(FindMatch).execute(9)).rejects.toMatchObject({
      kind: 'missing',
    });
  });
});
