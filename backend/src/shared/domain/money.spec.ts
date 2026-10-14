import { Money } from './money.js';

describe('Money', () => {
  it('rounds half away from zero to two decimal places', () => {
    expect(Money.roundHalfAwayFromZero('14.775').amount).toBe(14.78);
    expect(Money.roundHalfAwayFromZero('0.385').amount).toBe(0.39);
    expect(Money.roundHalfAwayFromZero('-1.225').amount).toBe(-1.23);
  });

  it('keeps a value that already has at most two decimal places', () => {
    expect(Money.roundHalfAwayFromZero('40').amount).toBe(40);
    expect(Money.roundHalfAwayFromZero('10.5').amount).toBe(10.5);
    expect(Money.roundHalfAwayFromZero('10.54').amount).toBe(10.54);
  });
});
