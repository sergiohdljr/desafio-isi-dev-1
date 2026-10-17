import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../../../common/clock/clock.js';
import { LEAGUE_REPOSITORY } from '../../repositories/league-repository.js';
import {
  InMemoryLeagueRepository,
  type MemoryLeaguePlayer,
} from '../../../infra/repositories/in-memory-league-repository.js';
import { PlayMatch } from '../match.use-case.js';

const playedAt = new Date('2027-04-01T15:00:00.000Z');

function side(clubId: number, names: string[]): MemoryLeaguePlayer[] {
  const positions = ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'] as const;
  return names.map((name, index) => ({
    id: clubId * 10 + index + 1,
    name,
    clubId,
    condition: 'APTO',
    position: positions[index],
    shooting: 80,
    passing: 70,
    dribbling: 60,
    defending: 75,
  }));
}

describe('play match', () => {
  it('stores the match decided from the saved lineups', async () => {
    const league = new InMemoryLeagueRepository(
      [],
      [
        { id: 1, name: 'Alpha FC' },
        { id: 2, name: 'Beta FC' },
      ],
      [...side(1, ['A', 'B', 'C', 'D', 'E']), ...side(2, ['F', 'G', 'H', 'I', 'J'])],
    );
    await league.replaceLineup(1, '2-2', [11, 12, 13, 14, 15], () => undefined);
    await league.replaceLineup(2, '2-2', [21, 22, 23, 24, 25], () => undefined);
    const module = await Test.createTestingModule({
      providers: [
        PlayMatch,
        { provide: LEAGUE_REPOSITORY, useValue: league },
        { provide: CLOCK, useValue: { now: () => playedAt } },
      ],
    }).compile();

    const match = await module.get(PlayMatch).execute({
      homeClubId: 1,
      awayClubId: 2,
    });

    expect(match.id).toBe(1);
    expect(match.playedAt).toEqual(playedAt);
    expect(match.homeClubId).toBe(1);
    expect(match.awayClubId).toBe(2);
    expect(match.duels.length).toBeGreaterThan(0);
    expect(await league.findMatch(1)).not.toBeNull();
  });
});
