import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/memory/in-memory-clubs-repository.js';
import { InMemoryPlayersRepository } from '../../../infra/memory/in-memory-players-repository.js';
import { PLAYERS_REPOSITORY } from '../../repositories/players-repository.js';
import { FindPlayer } from '../find-player.use-case.js';

describe('find player', () => {
  it('does not save when the player is missing', async () => {
    const repo = new InMemoryPlayersRepository();
    const module = await Test.createTestingModule({
      providers: [
        FindPlayer,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await expect(module.get(FindPlayer).execute(9)).rejects.toMatchObject({
      kind: 'missing',
    });
    expect(repo.saved).toHaveLength(0);
  });
});
