import { Test } from '@nestjs/testing';
import { LEAGUE_REPOSITORY } from '../../repositories/league-repository.js';
import {
  InMemoryLeagueRepository,
  type MemoryLeaguePlayer,
} from '../../../infra/repositories/in-memory-league-repository.js';
import { SetLineup } from '../lineup.use-case.js';

function squad(clubId: number): MemoryLeaguePlayer[] {
  const positions = ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'] as const;
  return positions.map((position, index) => ({
    id: index + 1,
    name: `Titular ${index + 1}`,
    clubId,
    condition: 'APTO' as const,
    position,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defending: 70,
  }));
}

describe('set lineup', () => {
  it('refuses a missing club and a missing player', async () => {
    const league = new InMemoryLeagueRepository([], [{ id: 1, name: 'Alpha FC' }], squad(1));
    const module = await Test.createTestingModule({
      providers: [
        SetLineup,
        { provide: LEAGUE_REPOSITORY, useValue: league },
      ],
    }).compile();
    const set = module.get(SetLineup);

    await expect(
      set.execute(9, { formation: '2-2', playerIds: [1, 2, 3, 4, 5] }),
    ).rejects.toMatchObject({ kind: 'missing' });
    await expect(
      set.execute(1, { formation: '2-2', playerIds: [1, 2, 3, 4, 99] }),
    ).rejects.toMatchObject({ kind: 'missing' });
  });

  it('stores a lineup that fits the formation', async () => {
    const league = new InMemoryLeagueRepository(
      [],
      [{ id: 1, name: 'Alpha FC' }],
      squad(1),
    );
    const module = await Test.createTestingModule({
      providers: [
        SetLineup,
        { provide: LEAGUE_REPOSITORY, useValue: league },
      ],
    }).compile();

    const lineup = await module.get(SetLineup).execute(1, {
      formation: '2-2',
      playerIds: [1, 2, 3, 4, 5],
    });

    expect(lineup.complete).toBe(true);
    expect(lineup.formation).toBe('2-2');
    expect(lineup.players).toHaveLength(5);
  });
});
