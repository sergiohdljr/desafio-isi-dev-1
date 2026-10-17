import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { Club } from '../../../../clubs/domain/entities/club.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/repositories/in-memory-clubs-repository.js';
import { InMemoryLeagueRepository } from '../../../infra/repositories/in-memory-league-repository.js';
import {
  LEAGUE_REPOSITORY,
  type SavedMatch,
} from '../../repositories/league-repository.js';
import { ListStandings } from '../match.use-case.js';

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

describe('list standings', () => {
  it('ranks the table from the clubs and their matches', async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListStandings,
        {
          provide: LEAGUE_REPOSITORY,
          useValue: new InMemoryLeagueRepository([played]),
        },
        {
          provide: CLUBS_REPOSITORY,
          useValue: new InMemoryClubsRepository([
            club(1, 'Alpha FC'),
            club(2, 'Beta FC'),
          ]),
        },
      ],
    }).compile();

    const table = await module.get(ListStandings).execute();
    expect(table.map((row) => row.clubName)).toEqual(['Alpha FC', 'Beta FC']);
    expect(table[0]).toMatchObject({ points: 3, wins: 1, goalsFor: 2 });
    expect(table[1]).toMatchObject({ points: 0, losses: 1, goalsAgainst: 2 });
  });
});
