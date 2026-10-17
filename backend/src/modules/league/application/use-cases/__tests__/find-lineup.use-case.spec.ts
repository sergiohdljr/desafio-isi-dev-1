import { Test } from '@nestjs/testing';
import { LEAGUE_REPOSITORY } from '../../repositories/league-repository.js';
import { InMemoryLeagueRepository } from '../../../infra/repositories/in-memory-league-repository.js';
import { FindLineup } from '../lineup.use-case.js';

describe('find lineup', () => {
  it('shows an empty lineup when the club has not set one', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindLineup,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository(
            [],
            [{ id: 1, name: 'Alpha FC' }],
          ),
        },
      ],
    }).compile();

    const lineup = await module.get(FindLineup).execute(1);
    expect(lineup).toMatchObject({
      clubId: 1,
      formation: null,
      complete: false,
      players: [],
    });
  });

  it('answers that a missing club does not exist', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindLineup,
        { provide: LEAGUE_REPOSITORY, useValue: new InMemoryLeagueRepository() },
      ],
    }).compile();

    await expect(module.get(FindLineup).execute(4)).rejects.toMatchObject({
      kind: 'missing',
    });
  });
});
