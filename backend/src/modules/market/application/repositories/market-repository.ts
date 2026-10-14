import { Money } from '../../../../shared/domain/money.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../policies/decide-purchase.js';
import { type SaleFacts, type SaleWrite } from '../policies/decide-sale.js';

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
  sale(
    playerId: number,
    settle: (facts: SaleFacts) => SaleWrite,
  ): Promise<SaleReceipt>;
  list(clubId: number): Promise<TransactionPage>;
}

export type StoredTransaction = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  type: 'COMPRA' | 'VENDA';
  value: Money;
  fee: Money;
  penalty: Money;
  profit: Money | null;
  cashChange: Money;
  createdAt: Date;
};

export type TransactionPage = {
  clubFound: boolean;
  transactions: StoredTransaction[];
};

export type SaleReceipt = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  value: Money;
  fee: Money;
  penalty: Money;
  profit: Money;
  cashChange: Money;
  createdAt: Date;
  purchaseValue: Money;
  remainingDays: number;
  penaltyRate: number;
  contractStatus: SaleWrite['contractStatus'];
  clubCash: Money;
};
