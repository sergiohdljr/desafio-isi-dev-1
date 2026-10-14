import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { assertLoyaltyWindow } from '../../domain/loyalty-window.js';
import { exceedsHalfCash, purchaseFee } from '../../domain/purchase-cost.js';

export type PurchasePlayer = {
  id: number;
  name: string;
  clubId: number | null;
  marketValue: Money;
};

export const SQUAD_LIMIT = 12;

export type PurchaseClub = {
  id: number;
  cash: Money;
  squadSize: number;
};

export type PurchaseFacts = {
  player: PurchasePlayer | null;
  club: PurchaseClub | null;
  previouslySoldByClub: boolean;
};

export type PurchaseWrite = {
  playerName: string;
  value: Money;
  fee: Money;
  cashChange: Money;
  loyaltyUntil: Date;
  at: Date;
};

export function decidePurchase(
  facts: PurchaseFacts,
  loyaltyUntil: Date,
  boughtAt: Date,
): PurchaseWrite {
  assertLoyaltyWindow(loyaltyUntil, boughtAt);
  if (!facts.player) {
    throw new DomainError('missing', 'Jogador não encontrado');
  }
  if (!facts.club) {
    throw new DomainError('missing', 'Clube não encontrado');
  }
  if (facts.player.clubId !== null) {
    throw new DomainError('conflict', 'Jogador não está livre');
  }
  if (facts.previouslySoldByClub) {
    throw new DomainError(
      'conflict',
      'O clube não pode recomprar um jogador que já vendeu',
    );
  }
  if (facts.club.squadSize >= SQUAD_LIMIT) {
    throw new DomainError('conflict', 'O elenco já tem 12 jogadores');
  }

  const value = facts.player.marketValue;
  const fee = purchaseFee(value);
  const cost = Money.fromCents(value.cents + fee.cents);
  if (exceedsHalfCash(cost, facts.club.cash)) {
    throw new DomainError('conflict', 'O custo passa de 50% do caixa');
  }
  return {
    playerName: facts.player.name,
    value,
    fee,
    cashChange: Money.fromCents(-cost.cents),
    loyaltyUntil,
    at: boughtAt,
  };
}
