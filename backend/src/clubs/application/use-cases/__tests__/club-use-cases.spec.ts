import { Test } from '@nestjs/testing';
import { Club } from '../../../domain/entities/club.js';
import { sameClubName } from '../../../domain/entities/club-name.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../../repositories/clubs-repository.js';
import { Money } from '../../../../shared/domain/money.js';
import { Player, type RegisterPlayer } from '../../../../players/domain/entities/player.js';
import {
  CLOCK,
} from '../../clock.js';
import {
  type SquadMember,
} from '../../repositories/clubs-repository.js';
import { CreateClub } from '../create-club.use-case.js';
import { FindClub } from '../find-club.use-case.js';
import { ListClubs } from '../list-clubs.use-case.js';

function stored(name: string, acronym: string, id: number): Club {
  const opened = Club.open(name, acronym);
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

function repository(clubs: Club[] = [], squad: SquadMember[] = []) {
  const saved: Club[] = [];
  let nextId = clubs.reduce((max, club) => Math.max(max, club.id), 0) + 1;
  const repo: ClubsRepository = {
    async add(club) {
      const created = stored(club.name, club.acronym, nextId);
      nextId += 1;
      clubs.push(created);
      saved.push(created);
      return created;
    },
    async findById(id) {
      return clubs.find((club) => club.id === id) ?? null;
    },
    async count() {
      return clubs.length;
    },
    async nameTaken(name) {
      return clubs.some((club) => sameClubName(club.name, name));
    },
    async acronymTaken(acronym) {
      return clubs.some((club) => club.acronym === acronym);
    },
    async list() {
      return clubs;
    },
    async squad() {
      return squad;
    },
  };
  return { repo, saved };
}

const pricedMeia: RegisterPlayer = {
  name: 'Meia Lista',
  position: 'MEI',
  agility: 50,
  age: 25,
  pace: 70,
  shooting: 70,
  passing: 80,
  dribbling: 80,
  defending: 50,
  physical: 70,
  potential: 86,
};

function member(clubId: number, id: number, name = pricedMeia.name): Player {
  const draft = Player.register({ ...pricedMeia, name });
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

function contracted(
  player: Player,
  loyaltyUntil: Date,
  purchaseValue = Money.fromCents(2550),
): SquadMember {
  if (player.clubId === null) {
    throw new Error('Elenco de teste sem clube');
  }
  return {
    clubId: player.clubId,
    player,
    purchaseValue,
    loyaltyUntil,
  };
}

async function useCase<T>(
  token: new (...args: never[]) => T,
  repo: ClubsRepository,
) {
  const module = await Test.createTestingModule({
    providers: [
      token,
      { provide: CLUBS_REPOSITORY, useValue: repo },
      {
        provide: CLOCK,
        useValue: { now: () => new Date('2027-03-02T15:00:00.000Z') },
      },
    ],
  }).compile();
  return module.get(token);
}

describe('club use cases', () => {
  it('opens a club with 300 cash, an empty squad and the same net worth', async () => {
    const { repo } = repository();
    const create = await useCase(CreateClub, repo);

    const created = await create.execute({
      name: 'Águias FC',
      acronym: 'AFC',
    });

    expect(created).toMatchObject({
      id: 1,
      name: 'Águias FC',
      acronym: 'AFC',
      cash: 300,
      squadValue: 0,
      netWorth: 300,
    });
    expect(await repo.findById(1)).not.toBeNull();
  });

  it('refuses a repeated name or acronym and does not save', async () => {
    const { repo, saved } = repository([stored('Águias FC', 'AFC', 1)]);
    const create = await useCase(CreateClub, repo);

    await expect(
      create.execute({ name: 'águias fc', acronym: 'AGU' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    await expect(
      create.execute({ name: 'Aguias FC', acronym: 'AFC' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect(saved).toHaveLength(0);

    const created = await create.execute({
      name: 'Aguias FC',
      acronym: 'AGF',
    });
    expect(created.name).toBe('Aguias FC');
    expect(saved).toHaveLength(1);
  });

  it('accepts the 20th club and refuses the 21st without saving it', async () => {
    const existing = Array.from({ length: 19 }, (_, index) => {
      const second = String.fromCharCode(65 + (index % 25));
      const third = String.fromCharCode(66 + (index % 24));
      return stored(`Clube ${index + 1} Norte`, `C${second}${third}`, index + 1);
    });
    const { repo, saved } = repository(existing);
    const create = await useCase(CreateClub, repo);

    const twentieth = await create.execute({
      name: 'Vigesimo Clube',
      acronym: 'VIG',
    });
    expect(twentieth.id).toBe(20);

    await expect(
      create.execute({ name: 'Clube Excedente', acronym: 'CEX' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect(saved).toHaveLength(1);
    expect(await repo.count()).toBe(20);
  });

  it('lists clubs by folded name and breaks a tie by id', async () => {
    const clubs = [
      stored('Gama FC', 'GAM', 6),
      stored('Ana-Maria FC', 'AMF', 4),
      stored('Delta FC', 'DEL', 5),
      stored('Épsilon FC', 'EPS', 7),
      stored('Ana Lima', 'ALI', 3),
      stored('Aguias FC', 'AGU', 8),
      stored('Águias FC', 'AFC', 2),
    ];
    const { repo } = repository(clubs);
    const list = await useCase(ListClubs, repo);

    const listed = await list.execute({ sort: 'name' });

    expect(listed.map((club) => club.name)).toEqual([
      'Águias FC',
      'Aguias FC',
      'Ana Lima',
      'Ana-Maria FC',
      'Delta FC',
      'Épsilon FC',
      'Gama FC',
    ]);
    expect(listed.map((club) => club.id)).toEqual([2, 8, 3, 4, 5, 7, 6]);
  });

  it('sorts by calculated net worth and then by name and id', async () => {
    const clubs = [
      stored('Alpha FC', 'AFC', 9),
      stored('Zulu FC', 'ZFC', 4),
      stored('Aguias FC', 'AGU', 7),
      stored('Águias FC', 'AGI', 2),
    ];
    const { repo } = repository(clubs, [contracted(member(9, 1), new Date('2027-06-01T15:00:00.000Z'))]);
    const list = await useCase(ListClubs, repo);

    const ascending = await list.execute({ sort: 'net_worth_asc' });
    expect(ascending.map((club) => club.name)).toEqual([
      'Águias FC',
      'Aguias FC',
      'Zulu FC',
      'Alpha FC',
    ]);
    expect(ascending.find((club) => club.name === 'Alpha FC')).toMatchObject({
      squadValue: 40,
      netWorth: 340,
    });
    expect(ascending.find((club) => club.name === 'Zulu FC')).toMatchObject({
      squadValue: 0,
      netWorth: 300,
    });

    const descending = await list.execute({ sort: 'net_worth_desc' });
    expect(descending.map((club) => club.name)).toEqual([
      'Alpha FC',
      'Águias FC',
      'Aguias FC',
      'Zulu FC',
    ]);
  });

  it('shows the ordered squad, the contract and the calculated totals', async () => {
    const club = stored('Águias FC', 'AFC', 1);
    const { repo } = repository(
      [club],
      [
        contracted(
          member(1, 3, 'Meia Épsilon'),
          new Date('2027-03-04T15:00:00.001Z'),
        ),
        contracted(
          member(1, 2, 'Meia Delta'),
          new Date('2027-03-04T15:00:00.000Z'),
        ),
      ],
    );
    const find = await useCase(FindClub, repo);

    const detail = await find.execute(1);

    expect(detail.squadValue).toBe(80);
    expect(detail.netWorth).toBe(380);
    expect(detail.players.map((player) => player.name)).toEqual([
      'Meia Delta',
      'Meia Épsilon',
    ]);
    expect(detail.players[0]).toMatchObject({
      id: 2,
      position: 'MEI',
      marketValue: 40,
      clubId: 1,
      contract: { purchaseValue: 25.5, remainingDays: 2 },
    });
    expect(detail.players[0].contract.loyaltyUntil).toEqual(
      new Date('2027-03-04T15:00:00.000Z'),
    );
    expect(detail.players[1].contract.remainingDays).toBe(3);
  });

  it('answers that a missing club does not exist', async () => {
    const { repo } = repository();
    const find = await useCase(FindClub, repo);

    await expect(find.execute(4)).rejects.toMatchObject({ kind: 'missing' });
  });
});
