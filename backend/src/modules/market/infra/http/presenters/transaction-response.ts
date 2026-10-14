import { formatBrasilia } from '../../../../clubs/infra/http/presenters/brasilia-time.js';
import { TransactionListView } from '../../../application/use-cases/list-transactions.use-case.js';

export function presentTransactions(view: TransactionListView) {
  return {
    data: view.data.map((row) => ({
      id: row.id,
      club_id: row.clubId,
      player_id: row.playerId,
      player_name: row.playerName,
      type: row.type,
      value: row.value,
      fee: row.fee,
      penalty: row.penalty,
      profit: row.profit,
      cash_change: row.cashChange,
      created_at: formatBrasilia(row.createdAt),
    })),
    summary: {
      total_spent: view.summary.totalSpent,
      total_received: view.summary.totalReceived,
      total_fees: view.summary.totalFees,
      total_penalties: view.summary.totalPenalties,
      total_profit: view.summary.totalProfit,
    },
  };
}
