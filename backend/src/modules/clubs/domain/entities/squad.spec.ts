import { Money } from '../../../../shared/domain/money.js';
import { Player } from '../../../players/domain/entities/player.js';
import { arrangeSquad, squadValueOf } from './squad.js';

describe('squad', () => {
  it('sums already rounded market values once, half away from zero', () => {
    expect(
      squadValueOf([Money.fromCents(1013), Money.fromCents(1012)]).amount,
    ).toBe(20.25);
    expect(squadValueOf([]).amount).toBe(0);
  });

  it('orders the squad from goalkeeper to forward, then by name and id', () => {
    const ordered = arrangeSquad([
      member('ATA', 'Atacante Beta', 4),
      member('MEI', 'Meia Épsilon', 3),
      member('GOL', 'Goleiro Alfa', 1),
      member('MEI', 'Meia Delta', 2),
      member('MEI', 'Meia Épsilon', 5),
    ]);

    expect(
      ordered.map((player) => [player.position, player.name, player.id]),
    ).toEqual([
      ['GOL', 'Goleiro Alfa', 1],
      ['MEI', 'Meia Delta', 2],
      ['MEI', 'Meia Épsilon', 3],
      ['MEI', 'Meia Épsilon', 5],
      ['ATA', 'Atacante Beta', 4],
    ]);
  });
});

function member(
  position: 'GOL' | 'MEI' | 'ATA',
  name: string,
  id: number,
): Player {
  const draft = Player.register({
    name,
    position,
    agility: 50,
    age: 25,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 50,
  });
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
