import { formatBrasilia } from '../../../../clubs/infra/http/presenters/brasilia-time.js';
import type { PurchaseView } from '../../../application/use-cases/buy-player.use-case.js';

export function presentPurchase(view: PurchaseView) {
  return {
    id: view.id,
    club_id: view.clubId,
    player_id: view.playerId,
    player_name: view.playerName,
    type: 'COMPRA' as const,
    value: view.value,
    fee: view.fee,
    penalty: view.penalty,
    profit: view.profit,
    cash_change: view.cashChange,
    created_at: formatBrasilia(view.createdAt),
    contract: {
      purchase_value: view.value,
      loyalty_until: formatBrasilia(view.loyaltyUntil),
      status: 'ATIVO' as const,
    },
    club_cash: view.clubCash,
  };
}
