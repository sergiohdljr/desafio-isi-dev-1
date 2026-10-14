import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { summarize } from '../../domain/transaction-summary.js';
import {
  MARKET_REPOSITORY,
  type MarketRepository,
  type StoredTransaction,
} from '../repositories/market-repository.js';

export const LIST_TRANSACTIONS = Symbol('LIST_TRANSACTIONS');

export type TransactionView = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  type: 'COMPRA' | 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cashChange: number;
  createdAt: Date;
};

export type TransactionListView = {
  data: TransactionView[];
  summary: {
    totalSpent: number;
    totalReceived: number;
    totalFees: number;
    totalPenalties: number;
    totalProfit: number;
  };
};

export interface ListTransactionsPort {
  execute(clubId: number): Promise<TransactionListView>;
}

@Injectable()
export class ListTransactions implements ListTransactionsPort {
  constructor(
    @Inject(MARKET_REPOSITORY) private readonly market: MarketRepository,
  ) {}

  async execute(clubId: number): Promise<TransactionListView> {
    const page = await this.market.list(clubId);
    if (!page.clubFound) {
      throw new DomainError('missing', 'Clube não encontrado');
    }

    const summary = summarize(page.transactions);
    return {
      data: page.transactions.map(toView),
      summary: {
        totalSpent: summary.totalSpent.amount,
        totalReceived: summary.totalReceived.amount,
        totalFees: summary.totalFees.amount,
        totalPenalties: summary.totalPenalties.amount,
        totalProfit: summary.totalProfit.amount,
      },
    };
  }
}

function toView(row: StoredTransaction): TransactionView {
  return {
    id: row.id,
    clubId: row.clubId,
    playerId: row.playerId,
    playerName: row.playerName,
    type: row.type,
    value: row.value.amount,
    fee: row.fee.amount,
    penalty: row.penalty.amount,
    profit: row.profit?.amount ?? null,
    cashChange: row.cashChange.amount,
    createdAt: row.createdAt,
  };
}
