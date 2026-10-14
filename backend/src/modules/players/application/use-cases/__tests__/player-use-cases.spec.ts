import { Test } from '@nestjs/testing';
import {
  Player,
  type RegisterPlayer,
} from '../../../domain/entities/player.js';
import {
  PLAYERS_REPOSITORY,
  type PlayersRepository,
} from '../../repositories/players-repository.js';
import { type PlayerListQuery } from '../../queries/player-list-query.js';
import { ChangePlayerCondition } from '../change-player-condition.use-case.js';
import { CreatePlayer } from '../create-player.use-case.js';
import { DeletePlayer } from '../delete-player.use-case.js';
import { FindPlayer } from '../find-player.use-case.js';
import { ListPlayers } from '../list-players.use-case.js';
import { UpdatePlayer } from '../update-player.use-case.js';

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

const listQuery: PlayerListQuery = {
  sorts: ['name'],
  page: 1,
  limit: 10,
};

function store(
  input: RegisterPlayer,
  id: number,
  clubId: number | null = null,
) {
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

function repository(options?: { players?: Player[]; clubs?: number[] }) {
  const players = [...(options?.players ?? [])];
  const clubs = new Set(options?.clubs ?? []);
  const saved: Player[] = [];
  let nextId = players.reduce((max, player) => Math.max(max, player.id), 0) + 1;
  const repo: PlayersRepository = {
    async add(player) {
      const stored = store(
        {
          name: player.name,
          position: player.position,
          agility: player.agility,
          age: player.age,
          pace: player.pace,
          shooting: player.shooting,
          passing: player.passing,
          dribbling: player.dribbling,
          defending: player.defending,
          physical: player.physical,
          potential: player.potential,
        },
        nextId,
      );
      nextId += 1;
      players.push(stored);
      return stored;
    },
    async findActiveById(id) {
      return (
        players.find((player) => player.id === id && !player.excluded) ?? null
      );
    },
    async findActive() {
      return players.filter((player) => !player.excluded);
    },
    async clubExists(id) {
      return clubs.has(id);
    },
    async save(player) {
      saved.push(player);
    },
  };
  return { repo, saved };
}

async function useCase<T>(
  token: new (...args: never[]) => T,
  repo: PlayersRepository,
) {
  const module = await Test.createTestingModule({
    providers: [token, { provide: PLAYERS_REPOSITORY, useValue: repo }],
  }).compile();
  return module.get(token);
}

describe('player use cases', () => {
  it('registers a free apt player and returns the stored id', async () => {
    const { repo } = repository();
    const create = await useCase(CreatePlayer, repo);

    const created = await create.execute(meia);

    expect(created.id).toBe(1);
    expect(created.condition).toBe('APTO');
    expect(created.clubId).toBeNull();
    expect(await repo.findActiveById(1)).not.toBeNull();
  });

  it('does not save when the player is missing', async () => {
    const { repo, saved } = repository();
    const find = await useCase(FindPlayer, repo);
    const update = await useCase(UpdatePlayer, repo);
    const condition = await useCase(ChangePlayerCondition, repo);
    const remove = await useCase(DeletePlayer, repo);

    await expect(find.execute(9)).rejects.toMatchObject({ kind: 'missing' });
    await expect(
      update.execute(9, {
        name: 'Meia Lua',
        position: 'MEI',
        agility: 85,
        age: 25,
      }),
    ).rejects.toMatchObject({ kind: 'missing' });
    await expect(condition.execute(9, 'DOENTE')).rejects.toMatchObject({
      kind: 'missing',
    });
    await expect(remove.execute(9)).rejects.toMatchObject({ kind: 'missing' });
    expect(saved).toHaveLength(0);
  });

  it('refuses to list a club that does not exist', async () => {
    const { repo, saved } = repository();
    const list = await useCase(ListPlayers, repo);

    await expect(
      list.execute({ ...listQuery, clubId: 4 }),
    ).rejects.toMatchObject({ kind: 'missing' });
    expect(saved).toHaveLength(0);
  });

  it('saves a condition change and skips a repeated condition', async () => {
    const player = store(meia, 3);
    const { repo, saved } = repository({ players: [player] });
    const change = await useCase(ChangePlayerCondition, repo);

    const updated = await change.execute(3, 'MAL_CONDICIONADO');
    expect(updated.condition).toBe('MAL_CONDICIONADO');
    expect(saved).toHaveLength(1);

    await change.execute(3, 'MAL_CONDICIONADO');
    expect(saved).toHaveLength(1);
  });

  it('saves an edit and a deletion of an existing player', async () => {
    const player = store({ ...meia, name: 'Meia Livre' }, 5);
    const { repo, saved } = repository({ players: [player] });
    const update = await useCase(UpdatePlayer, repo);
    const remove = await useCase(DeletePlayer, repo);

    const edited = await update.execute(5, {
      name: 'Meia Nova',
      position: 'MEI',
      agility: 70,
      age: 26,
    });
    expect(edited.name).toBe('Meia Nova');

    await remove.execute(5);
    expect(saved).toHaveLength(2);
    expect(player.excluded).toBe(true);
    expect(await repo.findActiveById(5)).toBeNull();
  });
});
