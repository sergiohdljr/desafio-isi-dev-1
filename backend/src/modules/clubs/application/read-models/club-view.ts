import { Money } from '../../../../shared/domain/money.js';
import { Club } from '../../domain/entities/club.js';

export type ClubView = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squadValue: number;
  netWorth: number;
};

export function clubViewOf(
  club: Club,
  squadValue: Money = Money.fromCents(0),
): ClubView {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash.amount,
    squadValue: squadValue.amount,
    netWorth: Money.fromCents(club.cash.cents + squadValue.cents).amount,
  };
}
