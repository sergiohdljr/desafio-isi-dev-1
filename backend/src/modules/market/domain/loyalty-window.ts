import { DomainError } from '../../../shared/domain/domain-error.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LOYALTY_MS = 1095 * DAY_MS;

export function assertLoyaltyWindow(loyaltyUntil: Date, boughtAt: Date): void {
  const delta = loyaltyUntil.getTime() - boughtAt.getTime();
  if (delta <= 0 || delta > MAX_LOYALTY_MS) {
    throw new DomainError(
      'invalid',
      'A fidelidade precisa ser futura e de no máximo 1.095 dias',
    );
  }
}
