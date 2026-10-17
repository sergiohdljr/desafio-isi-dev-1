import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../../../common/clock/clock.js';
import { Club } from '../../../domain/entities/club.js';
import { InMemoryClubsRepository } from '../../../infra/repositories/in-memory-clubs-repository.js';
import { InMemorySquadReader } from '../../../infra/repositories/in-memory-squad-reader.js';
import { CLUBS_REPOSITORY } from '../../repositories/clubs-repository.js';
import { SQUAD_READER } from '../../repositories/squad-reader.js';
import { CreateClub } from '../create-club.use-case.js';

function stored(name: string, acronym: string, id: number): Club {
  const opened = Club.open(name, acronym);
  return Club.reconstitute({
    id,
    name: opened.name,
    acronym: opened.acronym,
    cash: opened.cash,
  });
}

async function createClub(clubs: Club[] = []) {
  const repo = new InMemoryClubsRepository(clubs);
  const module = await Test.createTestingModule({
    providers: [
      CreateClub,
      { provide: CLUBS_REPOSITORY, useValue: repo },
      { provide: SQUAD_READER, useValue: new InMemorySquadReader() },
      {
        provide: CLOCK,
        useValue: { now: () => new Date('2027-03-02T15:00:00.000Z') },
      },
    ],
  }).compile();
  return { create: module.get(CreateClub), repo };
}

describe('create club', () => {
  it('opens a club with 300 cash, an empty squad and the same net worth', async () => {
    const { create, repo } = await createClub();

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
    const { create, repo } = await createClub([stored('Águias FC', 'AFC', 1)]);

    await expect(
      create.execute({ name: 'águias fc', acronym: 'AGU' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    await expect(
      create.execute({ name: 'Aguias FC', acronym: 'AFC' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect(repo.saved).toHaveLength(0);

    const created = await create.execute({
      name: 'Aguias FC',
      acronym: 'AGF',
    });
    expect(created.name).toBe('Aguias FC');
    expect(repo.saved).toHaveLength(1);
  });

  it('accepts the 20th club and refuses the 21st without saving it', async () => {
    const existing = Array.from({ length: 19 }, (_, index) => {
      const second = String.fromCharCode(65 + (index % 25));
      const third = String.fromCharCode(66 + (index % 24));
      return stored(
        `Clube ${index + 1} Norte`,
        `C${second}${third}`,
        index + 1,
      );
    });
    const { create, repo } = await createClub(existing);

    const twentieth = await create.execute({
      name: 'Vigesimo Clube',
      acronym: 'VIG',
    });
    expect(twentieth.id).toBe(20);

    await expect(
      create.execute({ name: 'Clube Excedente', acronym: 'CEX' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect(repo.saved).toHaveLength(1);
    expect(await repo.count()).toBe(20);
  });
});
