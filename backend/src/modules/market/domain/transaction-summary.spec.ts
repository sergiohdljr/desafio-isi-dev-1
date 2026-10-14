import { Money } from '../../../shared/domain/money.js';
import { summarize } from './transaction-summary.js';

function row(
  type: 'COMPRA' | 'VENDA',
  value: number,
  fee: number,
  penalty: number,
  profit: number | null,
  cashChange: number,
) {
  return {
    type,
    value: Money.fromCents(value),
    fee: Money.fromCents(fee),
    penalty: Money.fromCents(penalty),
    profit: profit === null ? null : Money.fromCents(profit),
    cashChange: Money.fromCents(cashChange),
  };
}

describe('transaction summary', () => {
  it('sums the purchase cost, the sale credit, the fees, the penalties and the signed profit', () => {
    const summary = summarize([
      row('COMPRA', 3700, 185, 0, null, -3885),
      row('VENDA', 4000, 30, 400, 300, 3570),
    ]);

    expect(summary.totalSpent.cents).toBe(3885);
    expect(summary.totalReceived.cents).toBe(3570);
    expect(summary.totalFees.cents).toBe(215);
    expect(summary.totalPenalties.cents).toBe(400);
    expect(summary.totalProfit.cents).toBe(300);
  });

  it('returns zeros when there are no transactions', () => {
    const summary = summarize([]);
    expect(summary.totalSpent.cents).toBe(0);
    expect(summary.totalReceived.cents).toBe(0);
    expect(summary.totalFees.cents).toBe(0);
    expect(summary.totalPenalties.cents).toBe(0);
    expect(summary.totalProfit.cents).toBe(0);
  });

  it('leaves the purchase total at zero when the rows are only sales', () => {
    const summary = summarize([row('VENDA', 4000, 30, 400, 300, 3570)]);
    expect(summary.totalSpent.cents).toBe(0);
    expect(summary.totalReceived.cents).toBe(3570);
  });
});
