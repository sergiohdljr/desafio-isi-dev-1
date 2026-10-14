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

  it('rounds the commission once, and charges nothing without profit', () => {
    expect(saleCommission(Money.fromCents(300)).cents).toBe(30);
    expect(saleCommission(Money.fromCents(385)).cents).toBe(39);
    expect(saleCommission(Money.fromCents(1000)).cents).toBe(100);
    expect(saleCommission(Money.fromCents(1001)).cents).toBe(100);
    expect(saleCommission(Money.fromCents(1500)).cents).toBe(200);
    expect(saleCommission(Money.fromCents(-750)).cents).toBe(0);
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

  it('rounds remaining days up and applies the band, capped at 10', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const longFraction = new Date(
      start.getTime() + ((116 * 24 + 17) * 60 + 35) * 60 * 1000,
    );
    expect(saleRemainingDays(longFraction, start)).toBe(117);

    expect(
      saleRemainingDays(
        new Date(start.getTime() + 10 * day + 2 * 60 * 60 * 1000),
        start,
      ),
    ).toBe(11);
    expect(penaltyRateFor(11)).toBe(5);
    expect(loyaltyPenalty(Money.fromCents(3000), 11).cents).toBe(150);
    expect(saleRemainingDays(new Date(start.getTime() + 30 * day), start)).toBe(30);
    expect(penaltyRateFor(30)).toBe(5);
    expect(saleRemainingDays(new Date(start.getTime() + 30 * day + 60 * 1000), start)).toBe(31);
    expect(penaltyRateFor(31)).toBe(10);
    expect(loyaltyPenalty(Money.fromCents(4000), 31).cents).toBe(400);
    expect(saleRemainingDays(new Date(start.getTime() + 180 * day), start)).toBe(180);
    expect(penaltyRateFor(180)).toBe(10);
    expect(saleRemainingDays(new Date(start.getTime() + 180 * day + 60 * 1000), start)).toBe(181);
    expect(penaltyRateFor(181)).toBe(20);
    expect(loyaltyPenalty(Money.fromCents(4250), 181).cents).toBe(850);
    expect(penaltyRateFor(200)).toBe(20);
    expect(loyaltyPenalty(Money.fromCents(7500), 200).cents).toBe(1000);
  });

  it('credits the cash from the worked sales', () => {
    expect(worked(3700, 4000, 31)).toEqual({
      penalty: 400,
      profit: 300,
      commission: 30,
      credit: 3570,
      contractStatus: 'RESCINDIDO',
      penaltyRate: 10,
    });
    expect(worked(5000, 4250, 181)).toEqual({
      penalty: 850,
      profit: -750,
      commission: 0,
      credit: 3400,
      contractStatus: 'RESCINDIDO',
      penaltyRate: 20,
    });
    expect(worked(2615, 3000, 11)).toEqual({
      penalty: 150,
      profit: 385,
      commission: 39,
      credit: 2811,
      contractStatus: 'RESCINDIDO',
      penaltyRate: 5,
    });
    expect(worked(6000, 7500, 200)).toEqual({
      penalty: 1000,
      profit: 1500,
      commission: 200,
      credit: 6300,
      contractStatus: 'RESCINDIDO',
      penaltyRate: 20,
    });
  });
});

function worked(purchaseCents: number, marketCents: number, days: number) {
  const soldAt = new Date('2026-11-05T19:40:00.000Z');
  const settled = settleSale({
    purchaseValue: Money.fromCents(purchaseCents),
    marketValue: Money.fromCents(marketCents),
    loyaltyUntil: new Date(soldAt.getTime() + days * 24 * 60 * 60 * 1000),
    soldAt,
  });
  return {
    penalty: settled.penalty.cents,
    profit: settled.profit.cents,
    commission: settled.commission.cents,
    credit: settled.credit.cents,
    contractStatus: settled.contractStatus,
    penaltyRate: settled.penaltyRate,
  };
}
