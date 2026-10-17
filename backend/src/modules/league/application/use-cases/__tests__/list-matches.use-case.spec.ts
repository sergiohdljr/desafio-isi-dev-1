import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { Club } from '../../../../clubs/domain/entities/club.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/memory/in-memory-clubs-repository.js';
import { InMemoryLeagueRepository } from '../../../infra/memory/in-memory-league-repository.js';
import {
  LEAGUE_REPOSITORY,
  type SavedMatch,
} from '../../repositories/league-repository.js';
import { ListMatches } from '../match.use-case.js';

function club(id: number, name: string): Club {
  const opened = Club.open(name, 'AAA');
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

const played: SavedMatch = {
  id: 1,
  playedAt: new Date('2027-04-01T15:00:00.000Z'),
  homeClubId: 1,
  awayClubId: 2,
  homeName: 'Casa',
  awayName: 'Fora',
  homeFormation: '2-2',
  awayFormation: '2-2',
  homeGoals: 2,
  awayGoals: 0,
  result: 'MANDANTE',
  duels: [],
};

describe('list matches', () => {
  it('refuses to list matches of a missing club', async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListMatches,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository(),
        },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await expect(module.get(ListMatches).execute(4)).rejects.toMatchObject({
      kind: 'missing',
    });
  });

  it('lists the matches of a club', async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListMatches,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository([played]),
        },
        {
          provide: CLUBS_REPOSITORY,
          useValue: new InMemoryClubsRepository([club(1, 'Alpha FC')]),
        },
      ],
    }).compile();

    const matches = await module.get(ListMatches).execute(1);
    expect(matches.map((item) => item.id)).toEqual([1]);
  });
});
