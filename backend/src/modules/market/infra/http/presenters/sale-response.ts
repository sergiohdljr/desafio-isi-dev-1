import { formatBrasilia } from '../../../../clubs/infra/http/presenters/brasilia-time.js';
import { SaleView } from '../../../application/use-cases/sell-player.use-case.js';

export function presentSale(view: SaleView) {
  return {
    id: view.id,
    club_id: view.clubId,
    player_id: view.playerId,
    player_name: view.playerName,
    type: 'VENDA' as const,
    value: view.value,
    fee: view.fee,
    penalty: view.penalty,
    profit: view.profit,
    cash_change: view.cashChange,
    created_at: formatBrasilia(view.createdAt),
    purchase_value: view.purchaseValue,
    remaining_days: view.remainingDays,
    penalty_rate: view.penaltyRate,
    contract_status: view.contractStatus,
    club_cash: view.clubCash,
  };
}
