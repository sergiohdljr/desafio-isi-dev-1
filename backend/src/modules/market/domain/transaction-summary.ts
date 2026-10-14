import { Money } from '../../../shared/domain/money.js';

export type SummaryRow = {
  type: 'COMPRA' | 'VENDA';
  value: Money;
  fee: Money;
  penalty: Money;
  profit: Money | null;
  cashChange: Money;
};

export type TransactionSummary = {
  totalSpent: Money;
  totalReceived: Money;
  totalFees: Money;
  totalPenalties: Money;
  totalProfit: Money;
};

export function summarize(rows: SummaryRow[]): TransactionSummary {
  let spent = 0;
  let received = 0;
  let fees = 0;
  let penalties = 0;
  let profit = 0;
  for (const row of rows) {
    fees += row.fee.cents;
    if (row.type === 'COMPRA') {
      spent += row.value.cents + row.fee.cents;
      continue;
    }
    received += row.cashChange.cents;
    penalties += row.penalty.cents;
    profit += row.profit?.cents ?? 0;
  }

  return {
    totalSpent: Money.fromCents(spent),
    totalReceived: Money.fromCents(received),
    totalFees: Money.fromCents(fees),
    totalPenalties: Money.fromCents(penalties),
    totalProfit: Money.fromCents(profit),
  };
}
