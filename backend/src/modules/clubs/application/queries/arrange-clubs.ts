import { compareNames } from '../../../../shared/domain/name-order.js';
import { Money } from '../../../../shared/domain/money.js';
import { Club } from '../../domain/entities/club.js';
import { ClubSort } from './club-list-query.js';

export type ClubWithSquad = {
  club: Club;
  squadValue: Money;
};

export function arrangeClubs(
  clubs: ClubWithSquad[],
  sort: ClubSort,
): ClubWithSquad[] {
  return [...clubs].sort((left, right) => compareClubs(left, right, sort));
}

function compareClubs(
  left: ClubWithSquad,
  right: ClubWithSquad,
  sort: ClubSort,
): number {
  if (sort !== 'name') {
    const leftWorth = left.club.cash.cents + left.squadValue.cents;
    const rightWorth = right.club.cash.cents + right.squadValue.cents;
    const difference =
      sort === 'net_worth_asc'
        ? leftWorth - rightWorth
        : rightWorth - leftWorth;
    if (difference !== 0) {
      return difference;
    }
  }

  const byName = compareNames(left.club.name, right.club.name);
  if (byName !== 0) {
    return byName;
  }
  return left.club.id - right.club.id;
}
