import { compareNames } from '../../../../shared/domain/name-order.js';
import { Money } from '../../../../shared/domain/money.js';
import { type Position } from '../../../players/domain/types/player-types.js';

export const positionOrder: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
};

type SquadPlayer = {
  position: Position;
  name: string;
  id: number;
};

export function squadValueOf(values: Money[]): Money {
  const cents = values.reduce((sum, value) => sum + value.cents, 0);
  return Money.fromCents(cents);
}

export function arrangeSquad<T extends SquadPlayer>(players: T[]): T[] {
  return [...players].sort((left, right) => {
    const byPosition =
      positionOrder[left.position] - positionOrder[right.position];
    if (byPosition !== 0) {
      return byPosition;
    }
    const byName = compareNames(left.name, right.name);
    if (byName !== 0) {
      return byName;
    }
    return left.id - right.id;
  });
}
