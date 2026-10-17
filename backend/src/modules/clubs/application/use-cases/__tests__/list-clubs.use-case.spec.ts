import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../../../common/clock/clock.js';
import { Money } from '../../../../../shared/domain/money.js';
import {
  Player,
  type RegisterPlayer,
} from '../../../../players/domain/entities/player.js';
import { Club } from '../../../domain/entities/club.js';
import { InMemoryClubsRepository } from '../../../infra/memory/in-memory-clubs-repository.js';
import { InMemorySquadReader } from '../../../infra/memory/in-memory-squad-reader.js';
import { CLUBS_REPOSITORY } from '../../repositories/clubs-repository.js';
import { SQUAD_READER, type SquadMember } from '../../repositories/squad-reader.js';
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

function member(clubId: number, id: number): Player {
  const draft = Player.register(pricedMeia);
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

async function listClubs(clubs: Club[], squad: SquadMember[] = []) {
  const module = await Test.createTestingModule({
    providers: [
      ListClubs,
      { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository(clubs) },
      { provide: SQUAD_READER, useValue: new InMemorySquadReader(squad) },
      {
        provide: CLOCK,
        useValue: { now: () => new Date('2027-03-02T15:00:00.000Z') },
      },
    ],
  }).compile();
  return module.get(ListClubs);
}

describe('list clubs', () => {
  it('lists clubs by folded name and breaks a tie by id', async () => {
    const list = await listClubs([
      stored('Gama FC', 'GAM', 6),
      stored('Ana-Maria FC', 'AMF', 4),
      stored('Delta FC', 'DEL', 5),
      stored('Épsilon FC', 'EPS', 7),
      stored('Ana Lima', 'ALI', 3),
      stored('Aguias FC', 'AGU', 8),
      stored('Águias FC', 'AFC', 2),
    ]);

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
    const player = member(9, 1);
    const list = await listClubs(
      [
        stored('Alpha FC', 'AFC', 9),
        stored('Zulu FC', 'ZFC', 4),
        stored('Aguias FC', 'AGU', 7),
        stored('Águias FC', 'AGI', 2),
      ],
      [
        {
          clubId: 9,
          player,
          purchaseValue: Money.fromCents(2550),
          loyaltyUntil: new Date('2027-06-01T15:00:00.000Z'),
        },
      ],
    );

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
});
