import { Money } from '../../../../shared/domain/money.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../policies/decide-purchase.js';

export const MARKET_REPOSITORY = Symbol('MARKET_REPOSITORY');

export type PurchaseReceipt = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  value: Money;
  fee: Money;
  cashChange: Money;
  createdAt: Date;
  loyaltyUntil: Date;
  clubCash: Money;
};

export interface MarketRepository {
  purchase(
    playerId: number,
    clubId: number,
    settle: (facts: PurchaseFacts) => PurchaseWrite,
  ): Promise<PurchaseReceipt>;
}
