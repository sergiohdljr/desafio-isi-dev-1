import { DomainError } from '../../../shared/domain/domain-error.js';
import { assertLoyaltyWindow } from './loyalty-window.js';

const boughtAt = new Date('2026-10-14T15:00:00.000Z');
const day = 24 * 60 * 60 * 1000;

describe('loyalty window', () => {
  it('[B12] accepts a future loyalty up to 1095 days after the purchase', () => {
    expect(() =>
      assertLoyaltyWindow(new Date(boughtAt.getTime() + day), boughtAt),
    ).not.toThrow();
    expect(() =>
      assertLoyaltyWindow(new Date(boughtAt.getTime() + 1095 * day), boughtAt),
    ).not.toThrow();
  });

  it('[B12] refuses the purchase instant and a loyalty past 1095 days', () => {
    expect(() => assertLoyaltyWindow(boughtAt, boughtAt)).toThrow(DomainError);
    expect(() =>
      assertLoyaltyWindow(new Date(boughtAt.getTime() - 1), boughtAt),
    ).toThrow(DomainError);
    expect(() =>
      assertLoyaltyWindow(
        new Date(boughtAt.getTime() + 1095 * day + 1),
        boughtAt,
      ),
    ).toThrow(DomainError);
  });
});
