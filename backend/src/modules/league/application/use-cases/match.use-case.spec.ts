import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../clubs/application/repositories/clubs-repository.js';
import { Club } from '../../../clubs/domain/entities/club.js';
import { InMemoryClubsRepository } from '../../../clubs/infra/memory/in-memory-clubs-repository.js';
import { type SavedMatch } from '../repositories/league-repository.js';
import { LEAGUE_REPOSITORY } from '../repositories/league-repository.js';
import { InMemoryLeagueRepository } from '../../infra/memory/in-memory-league-repository.js';
import { ListMatches, ListStandings } from './match.use-case.js';

function club(id: number, name: string): Club {
  const opened = Club.open(name, 'AAA');
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

function match(
  id: number,
  homeClubId: number,
  awayClubId: number,
  homeGoals: number,
  awayGoals: number,
): SavedMatch {
  return {
    id,
    playedAt: new Date('2027-04-01T15:00:00.000Z'),
    homeClubId,
    awayClubId,
    homeName: 'Casa',
    awayName: 'Fora',
    homeFormation: '2-2',
    awayFormation: '2-2',
    homeGoals,
    awayGoals,
    result: homeGoals === awayGoals ? 'EMPATE' : 'MANDANTE',
    duels: [],
  };
}

describe('match use cases', () => {
  it('refuses to list matches of a missing club', async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListMatches,
        { provide: LEAGUE_REPOSITORY, useValue: new InMemoryLeagueRepository() },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await expect(module.get(ListMatches).execute(4)).rejects.toMatchObject({
      kind: 'missing',
    });
  });

  it('lists the matches of a club and ranks the table from those clubs', async () => {
    const clubs = new InMemoryClubsRepository([
      club(1, 'Alpha FC'),
      club(2, 'Beta FC'),
    ]);
    const league = new InMemoryLeagueRepository([match(1, 1, 2, 2, 0)]);
    const module = await Test.createTestingModule({
      providers: [
        ListMatches,
        ListStandings,
        { provide: LEAGUE_REPOSITORY, useValue: league },
        { provide: CLUBS_REPOSITORY, useValue: clubs },
      ],
    }).compile();

    const matches = await module.get(ListMatches).execute(1);
    expect(matches.map((item) => item.id)).toEqual([1]);

    const table = await module.get(ListStandings).execute();
    expect(table.map((row) => row.clubName)).toEqual(['Alpha FC', 'Beta FC']);
    expect(table[0]).toMatchObject({ points: 3, wins: 1, goalsFor: 2 });
    expect(table[1]).toMatchObject({ points: 0, losses: 1, goalsAgainst: 2 });
  });
});
