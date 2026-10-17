import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/memory/in-memory-clubs-repository.js';
import { InMemoryPlayersRepository } from '../../../infra/memory/in-memory-players-repository.js';
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
});
