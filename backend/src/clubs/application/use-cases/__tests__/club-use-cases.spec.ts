import { Test } from '@nestjs/testing';
import { Club } from '../../../domain/entities/club.js';
import { sameClubName } from '../../../domain/entities/club-name.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../../repositories/clubs-repository.js';
import { CreateClub } from '../create-club.use-case.js';
import { FindClub } from '../find-club.use-case.js';

function stored(name: string, acronym: string, id: number): Club {
  const opened = Club.open(name, acronym);
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

function repository(clubs: Club[] = []) {
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
  };
  return { repo, saved };
}

async function useCase<T>(
  token: new (...args: never[]) => T,
  repo: ClubsRepository,
) {
  const module = await Test.createTestingModule({
    providers: [token, { provide: CLUBS_REPOSITORY, useValue: repo }],
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

  it('answers that a missing club does not exist', async () => {
    const { repo } = repository();
    const find = await useCase(FindClub, repo);

    await expect(find.execute(4)).rejects.toMatchObject({ kind: 'missing' });
  });
});
