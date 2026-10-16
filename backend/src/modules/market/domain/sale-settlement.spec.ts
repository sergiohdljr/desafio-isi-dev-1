import { Money } from '../../../shared/domain/money.js';
import {
  loyaltyPenalty,
  penaltyRateFor,
  saleCommission,
  saleRemainingDays,
  settleSale,
} from './sale-settlement.js';

const soldAt = new Date('2026-11-05T19:40:00.000Z');

describe('sale settlement', () => {
  it('counts zero days when loyalty is the sale instant or already past', () => {
    expect(saleRemainingDays(soldAt, soldAt)).toBe(0);
    expect(saleRemainingDays(new Date(soldAt.getTime() - 1), soldAt)).toBe(0);
  });

  it('closes the contract without a penalty when loyalty is over', () => {
    const settled = settleSale({
      purchaseValue: Money.fromCents(2500),
      marketValue: Money.fromCents(2500),
      loyaltyUntil: new Date(soldAt.getTime() - 1000),
      soldAt,
    });

    expect(settled).toMatchObject({
      remainingDays: 0,
      penaltyRate: 0,
      penalty: Money.fromCents(0),
      profit: Money.fromCents(0),
      commission: Money.fromCents(0),
      credit: Money.fromCents(2500),
      contractStatus: 'ENCERRADO',
    });
  });

  it('rounds a positive commission into the credit when there is no penalty', () => {
    const settled = settleSale({
      purchaseValue: Money.fromCents(1000),
      marketValue: Money.fromCents(1385),
      loyaltyUntil: soldAt,
      soldAt,
    });

    expect(settled.profit.cents).toBe(385);
    expect(settled.commission.cents).toBe(39);
    expect(settled.penalty.cents).toBe(0);
    expect(settled.credit.cents).toBe(1346);
    expect(settled.contractStatus).toBe('ENCERRADO');
  });
});

describe('loyalty penalty', () => {
  const day = 24 * 60 * 60 * 1000;
  const start = new Date('2026-01-01T00:00:00.000Z');
  const loyaltyBands = [
    { until: new Date(start.getTime() - 1), days: 0, rate: 0 as const },
    {
      until: new Date(start.getTime() + 10 * day + 2 * 60 * 60 * 1000),
      days: 11,
      rate: 5 as const,
    },
    { until: new Date(start.getTime() + 30 * day), days: 30, rate: 5 as const },
    {
      until: new Date(start.getTime() + 30 * day + 60 * 1000),
      days: 31,
      rate: 10 as const,
    },
    {
      until: new Date(start.getTime() + 180 * day),
      days: 180,
      rate: 10 as const,
    },
    {
      until: new Date(start.getTime() + 180 * day + 60 * 1000),
      days: 181,
      rate: 20 as const,
    },
    {
      until: new Date(start.getTime() + 200 * day),
      days: 200,
      rate: 20 as const,
    },
  ];

  it('rounds 116 days, 17 hours and 35 minutes up to 117', () => {
    const longFraction = new Date(
      start.getTime() + ((116 * 24 + 17) * 60 + 35) * 60 * 1000,
    );
    expect(saleRemainingDays(longFraction, start)).toBe(117);
  });

  it.each(loyaltyBands)(
    'counts $days remaining days at $rate percent',
    ({ until, days, rate }) => {
      expect(saleRemainingDays(until, start)).toBe(days);
      expect(penaltyRateFor(days)).toBe(rate);
    },
  );

  it('caps a 20 percent penalty of 15.00 at 10.00', () => {
    expect(loyaltyPenalty(Money.fromCents(7500), 200).cents).toBe(1000);
  });
});

const commissions = [
  { profit: '3.00', commission: '0.30' },
  { profit: '3.85', commission: '0.39' },
  { profit: '10.00', commission: '1.00' },
  { profit: '10.01', commission: '1.00' },
  { profit: '15.00', commission: '2.00' },
  { profit: '-7.50', commission: '0.00' },
];

describe('sale commission', () => {
  it.each(commissions)(
    'charges $commission on a profit of $profit',
    ({ profit, commission }) => {
      expect(
        saleCommission(Money.roundHalfAwayFromZero(profit)).toDecimalString(),
      ).toBe(commission);
    },
  );
});

const settlements = [
  {
    purchase: '37.00',
    market: '40.00',
    days: 31,
    penalty: '4.00',
    profit: '3.00',
    commission: '0.30',
    credit: '35.70',
    status: 'RESCINDIDO' as const,
  },
  {
    purchase: '50.00',
    market: '42.50',
    days: 181,
    penalty: '8.50',
    profit: '-7.50',
    commission: '0.00',
    credit: '34.00',
    status: 'RESCINDIDO' as const,
  },
  {
    purchase: '26.15',
    market: '30.00',
    days: 11,
    penalty: '1.50',
    profit: '3.85',
    commission: '0.39',
    credit: '28.11',
    status: 'RESCINDIDO' as const,
  },
  {
    purchase: '25.00',
    market: '25.00',
    days: 0,
    penalty: '0.00',
    profit: '0.00',
    commission: '0.00',
    credit: '25.00',
    status: 'ENCERRADO' as const,
  },
  {
    purchase: '60.00',
    market: '75.00',
    days: 200,
    penalty: '10.00',
    profit: '15.00',
    commission: '2.00',
    credit: '63.00',
    status: 'RESCINDIDO' as const,
  },
];

describe('sale credit', () => {
  it.each(settlements)(
    'credits $credit from a purchase of $purchase sold at $market',
    ({
      purchase,
      market,
      days,
      penalty,
      profit,
      commission,
      credit,
      status,
    }) => {
      const soldAt = new Date('2026-11-05T19:40:00.000Z');
      const settled = settleSale({
        purchaseValue: Money.roundHalfAwayFromZero(purchase),
        marketValue: Money.roundHalfAwayFromZero(market),
        loyaltyUntil: new Date(soldAt.getTime() + days * 24 * 60 * 60 * 1000),
        soldAt,
      });

      expect(settled.penalty.toDecimalString()).toBe(penalty);
      expect(settled.profit.toDecimalString()).toBe(profit);
      expect(settled.commission.toDecimalString()).toBe(commission);
      expect(settled.credit.toDecimalString()).toBe(credit);
      expect(settled.contractStatus).toBe(status);
    },
  );
});
