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

function member(id: number, name: string): Player {
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
    clubId: 1,
    excluded: false,
  });
}

function contracted(player: Player, loyaltyUntil: Date): SquadMember {
  return {
    clubId: 1,
    player,
    purchaseValue: Money.fromCents(2550),
    loyaltyUntil,
  };
}

async function findClub(clubs: Club[] = [], squad: SquadMember[] = []) {
  const module = await Test.createTestingModule({
    providers: [
      FindClub,
      { provide: CLUBS_REPOSITORY, useValue: new InMemoryClubsRepository(clubs) },
      { provide: SQUAD_READER, useValue: new InMemorySquadReader(squad) },
      {
        provide: CLOCK,
        useValue: { now: () => new Date('2027-03-02T15:00:00.000Z') },
      },
    ],
  }).compile();
  return module.get(FindClub);
}

describe('find club', () => {
  it('shows the ordered squad, the contract and the calculated totals', async () => {
    const find = await findClub(
      [stored('Águias FC', 'AFC', 1)],
      [
        contracted(member(3, 'Meia Épsilon'), new Date('2027-03-04T15:00:00.001Z')),
        contracted(member(2, 'Meia Delta'), new Date('2027-03-04T15:00:00.000Z')),
      ],
    );

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
      contract: { purchaseValue: 25.5, remainingDays: 2, penaltyRate: 5 },
    });
    expect(detail.players[0].contract.loyaltyUntil).toEqual(
      new Date('2027-03-04T15:00:00.000Z'),
    );
    expect(detail.players[1].contract.remainingDays).toBe(3);
    expect(detail.players[1].contract.penaltyRate).toBe(5);
  });

  it('answers that a missing club does not exist', async () => {
    const find = await findClub();

    await expect(find.execute(4)).rejects.toMatchObject({ kind: 'missing' });
  });
});
