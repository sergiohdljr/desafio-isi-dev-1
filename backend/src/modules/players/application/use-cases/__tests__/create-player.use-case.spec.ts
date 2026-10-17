import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/memory/in-memory-clubs-repository.js';
import { type RegisterPlayer } from '../../../domain/entities/player.js';
import { InMemoryPlayersRepository } from '../../../infra/memory/in-memory-players-repository.js';
import { PLAYERS_REPOSITORY } from '../../repositories/players-repository.js';
import { CreatePlayer } from '../create-player.use-case.js';

const meia: RegisterPlayer = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 68,
  shooting: 65,
  passing: 80,
  dribbling: 78,
  defending: 52,
  physical: 60,
  potential: 86,
};

describe('create player', () => {
  it('registers a free apt player and returns the stored id', async () => {
    const repo = new InMemoryPlayersRepository();
    const module = await Test.createTestingModule({
      providers: [
        CreatePlayer,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    const created = await module.get(CreatePlayer).execute(meia);

    expect(created.id).toBe(1);
    expect(created.condition).toBe('APTO');
    expect(created.clubId).toBeNull();
    expect(await repo.findActiveById(1)).not.toBeNull();
  });
});
