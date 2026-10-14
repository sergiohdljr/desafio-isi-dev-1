import { Money } from '../../../shared/domain/money.js';

const FEE_FREE_UNTIL_CENTS = 3000;

export function purchaseFee(market: Money): Money {
  if (market.cents <= FEE_FREE_UNTIL_CENTS) {
    return Money.fromCents(0);
  }

  return Money.fromRoundedRatio(market.cents * 5, 100);
}

export function exceedsHalfCash(cost: Money, cash: Money): boolean {
  return cost.cents * 2 > cash.cents;
}
