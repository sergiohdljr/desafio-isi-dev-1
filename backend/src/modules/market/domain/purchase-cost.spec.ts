import { Money } from '../../../shared/domain/money.js';
import { exceedsHalfCash, purchaseFee } from './purchase-cost.js';

const purchases = [
  {
    cash: '300.00',
    market: '28.00',
    fee: '0.00',
    cost: '28.00',
    accepted: true,
  },
  {
    cash: '300.00',
    market: '30.00',
    fee: '0.00',
    cost: '30.00',
    accepted: true,
  },
  {
    cash: '300.00',
    market: '30.01',
    fee: '1.50',
    cost: '31.51',
    accepted: true,
  },
  {
    cash: '100.00',
    market: '47.62',
    fee: '2.38',
    cost: '50.00',
    accepted: true,
  },
  {
    cash: '100.00',
    market: '48.00',
    fee: '2.40',
    cost: '50.40',
    accepted: false,
  },
];

describe('purchase cost', () => {
  it.each(purchases)(
    'prices $market from cash $cash as fee $fee and cost $cost',
    ({ cash, market, fee, cost, accepted }) => {
      const marketValue = Money.roundHalfAwayFromZero(market);
      const cashValue = Money.roundHalfAwayFromZero(cash);
      const charged = purchaseFee(marketValue);
      const total = Money.fromCents(marketValue.cents + charged.cents);

      expect(charged.toDecimalString()).toBe(fee);
      expect(total.toDecimalString()).toBe(cost);
      expect(exceedsHalfCash(total, cashValue)).toBe(!accepted);
    },
  );

  it('refuses 130.58 against half of 261.15 and accepts 130.57', () => {
    const cash = Money.fromCents(26115);

    expect(exceedsHalfCash(Money.fromCents(13058), cash)).toBe(true);
    expect(exceedsHalfCash(Money.fromCents(13057), cash)).toBe(false);
  });
});
