import { Test } from '@nestjs/testing';
import { CLUBS_REPOSITORY } from '../../../../clubs/application/repositories/clubs-repository.js';
import { InMemoryClubsRepository } from '../../../../clubs/infra/repositories/in-memory-clubs-repository.js';
import {
  Player,
  type RegisterPlayer,
} from '../../../domain/entities/player.js';
import { InMemoryPlayersRepository } from '../../../infra/repositories/in-memory-players-repository.js';
import { PLAYERS_REPOSITORY } from '../../repositories/players-repository.js';
import { DeletePlayer } from '../delete-player.use-case.js';

const meia: RegisterPlayer = {
  name: 'Meia Livre',
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

function store(input: RegisterPlayer, id: number): Player {
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
    clubId: null,
    excluded: false,
  });
}

describe('delete player', () => {
  it('does not save when the player is missing', async () => {
    const repo = new InMemoryPlayersRepository();
    const module = await Test.createTestingModule({
      providers: [
        DeletePlayer,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await expect(module.get(DeletePlayer).execute(9)).rejects.toMatchObject({
      kind: 'missing',
    });
    expect(repo.saved).toHaveLength(0);
  });

  it('saves a deletion of an existing player', async () => {
    const player = store(meia, 5);
    const repo = new InMemoryPlayersRepository([player]);
    const module = await Test.createTestingModule({
      providers: [
        DeletePlayer,
        { provide: PLAYERS_REPOSITORY, useValue: repo },
        { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository() },
      ],
    }).compile();

    await module.get(DeletePlayer).execute(5);

    expect(repo.saved).toHaveLength(1);
    expect(player.excluded).toBe(true);
    expect(await repo.findActiveById(5)).toBeNull();
  });
});
