import { Money } from '../../../shared/domain/money.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const PENALTY_CAP_CENTS = 1000;

export type ContractStatus = 'ENCERRADO' | 'RESCINDIDO';

export type SaleTerms = {
  remainingDays: number;
  penaltyRate: 0 | 5 | 10 | 20;
  penalty: Money;
  profit: Money;
  commission: Money;
  credit: Money;
  contractStatus: ContractStatus;
};

export function saleRemainingDays(loyaltyUntil: Date, soldAt: Date): number {
  const delta = loyaltyUntil.getTime() - soldAt.getTime();
  if (delta <= 0) {
    return 0;
  }
  return Math.ceil(delta / DAY_MS);
}

export function penaltyRateFor(days: number): 0 | 5 | 10 | 20 {
  if (days <= 0) {
    return 0;
  }
  if (days <= 30) {
    return 5;
  }
  if (days <= 180) {
    return 10;
  }
  return 20;
}

export function loyaltyPenalty(market: Money, days: number): Money {
  const rate = penaltyRateFor(days);
  if (rate === 0) {
    return Money.fromCents(0);
  }
  const raw = Money.fromRoundedRatio(market.cents * rate, 100);
  return raw.cents > PENALTY_CAP_CENTS
    ? Money.fromCents(PENALTY_CAP_CENTS)
    : raw;
}

export function saleCommission(profit: Money): Money {
  if (profit.cents <= 0) {
    return Money.fromCents(0);
  }
  const first = Math.min(profit.cents, 1000);
  const rest = profit.cents - first;
  return Money.fromRoundedRatio(first * 10 + rest * 20, 100);
}

export function settleSale(input: {
  purchaseValue: Money;
  marketValue: Money;
  loyaltyUntil: Date;
  soldAt: Date;
}): SaleTerms {
  const remainingDays = saleRemainingDays(input.loyaltyUntil, input.soldAt);
  const penaltyRate = penaltyRateFor(remainingDays);
  const penalty = loyaltyPenalty(input.marketValue, remainingDays);
  const profit = Money.fromCents(
    input.marketValue.cents - input.purchaseValue.cents,
  );
  const commission = saleCommission(profit);
  return {
    remainingDays,
    penaltyRate,
    penalty,
    profit,
    commission,
    credit: Money.fromCents(
      input.marketValue.cents - penalty.cents - commission.cents,
    ),
    contractStatus: penalty.cents > 0 ? 'RESCINDIDO' : 'ENCERRADO',
  };
}
