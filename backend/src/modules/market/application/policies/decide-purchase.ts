import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { assertLoyaltyWindow } from '../../domain/loyalty-window.js';
import { purchaseFee } from '../../domain/purchase-cost.js';

export type PurchasePlayer = {
  id: number;
  name: string;
  clubId: number | null;
  marketValue: Money;
};

export type PurchaseClub = {
  id: number;
  cash: Money;
};

export type PurchaseFacts = {
  player: PurchasePlayer | null;
  club: PurchaseClub | null;
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

  const value = facts.player.marketValue;
  const fee = purchaseFee(value);
  const cost = Money.fromCents(value.cents + fee.cents);
  return {
    playerName: facts.player.name,
    value,
    fee,
    cashChange: Money.fromCents(-cost.cents),
    loyaltyUntil,
    at: boughtAt,
  };
}
