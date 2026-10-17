import { Test } from '@nestjs/testing';
import { Club } from '../../../../clubs/domain/entities/club.js';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/repositories/in-memory-clubs-repository.js';
import {
  Player,
  type RegisterPlayer,
} from '../../../domain/entities/player.js';
import { InMemoryPlayersRepository } from '../../../infra/repositories/in-memory-players-repository.js';
import { type PlayerListQuery } from '../../queries/player-list-query.js';
import { PLAYERS_REPOSITORY } from '../../repositories/players-repository.js';
import { ListPlayers } from '../list-players.use-case.js';

const listQuery: PlayerListQuery = {
  sorts: ['name'],
  page: 1,
  limit: 10,
};

describe('list players', () => {
  it('refuses to list a club that does not exist', async () => {
    const repo = new InMemoryPlayersRepository();
    const module = await Test.createTestingModule({
      providers: [
        ListPlayers,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await expect(
      module.get(ListPlayers).execute({ ...listQuery, clubId: 4 }),
    ).rejects.toMatchObject({ kind: 'missing' });
    expect(repo.saved).toHaveLength(0);
  });

  it('returns the page when the club exists', async () => {
    const opened = Club.open('Alpha FC', 'AFC');
    const clubs = new InMemoryClubsRepository([
      Club.reconstitute({
        id: 1,
        name: opened.name,
        acronym: opened.acronym,
        cash: opened.cash,
      }),
    ]);
    const repo = new InMemoryPlayersRepository([store(meia, 3, 1)]);
    const module = await Test.createTestingModule({
      providers: [
        ListPlayers,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: clubs },
      ],
    }).compile();

    const page = await module.get(ListPlayers).execute({
      ...listQuery,
      clubId: 1,
    });

    expect(page.data.map((player) => player.id)).toEqual([3]);
    expect(page.meta).toMatchObject({ page: 1, totalItems: 1, totalPages: 1 });
  });
});

const meia: RegisterPlayer = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 50,
  age: 25,
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50,
  potential: 50,
};

function store(input: RegisterPlayer, id: number, clubId: number): Player {
  const draft = Player.register(input);
  return Player.reconstitute({
    id,
    name: draft.name,
    position: draft.position,
    agility: draft.agility,
    age: draft.age,
    condition: draft.condition,
    baseValue: draft.baseValue,
    pace: draft.pace,
    shooting: draft.shooting,
    passing: draft.passing,
    dribbling: draft.dribbling,
    defending: draft.defending,
    physical: draft.physical,
    potential: draft.potential,
    clubId,
    excluded: false,
  });
}
