import { Money } from '../../../shared/domain/money.js';
import { exceedsHalfCash, purchaseFee } from './purchase-cost.js';

describe('purchase cost', () => {
  it('charges no fee at or below 30 and 5 percent above it, rounded once', () => {
    expect(purchaseFee(Money.fromCents(2800)).cents).toBe(0);
    expect(purchaseFee(Money.fromCents(3000)).cents).toBe(0);
    expect(purchaseFee(Money.fromCents(3001)).cents).toBe(150);
    expect(purchaseFee(Money.fromCents(4762)).cents).toBe(238);
    expect(purchaseFee(Money.fromCents(4800)).cents).toBe(240);
  });

  it('accepts a cost equal to half the cash and refuses one cent above that half', () => {
    expect(exceedsHalfCash(Money.fromCents(5000), Money.fromCents(10000))).toBe(
      false,
    );
    expect(exceedsHalfCash(Money.fromCents(5040), Money.fromCents(10000))).toBe(
      true,
    );
    expect(
      exceedsHalfCash(Money.fromCents(13058), Money.fromCents(26115)),
    ).toBe(true);
    expect(
      exceedsHalfCash(Money.fromCents(13057), Money.fromCents(26115)),
    ).toBe(false);
  });
});
