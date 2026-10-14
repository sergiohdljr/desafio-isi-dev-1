import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../clubs/application/clock.js';
import { decideSale } from '../policies/decide-sale.js';
import {
  MARKET_REPOSITORY,
  type MarketRepository,
  type SaleReceipt,
} from '../repositories/market-repository.js';

export const SELL_PLAYER = Symbol('SELL_PLAYER');

export type SaleView = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cashChange: number;
  createdAt: Date;
  purchaseValue: number;
  remainingDays: number;
  penaltyRate: number;
  contractStatus: SaleReceipt['contractStatus'];
  clubCash: number;
};

export interface SellPlayerPort {
  execute(playerId: number): Promise<SaleView>;
}

@Injectable()
export class SellPlayer implements SellPlayerPort {
  constructor(
    @Inject(MARKET_REPOSITORY) private readonly market: MarketRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(playerId: number): Promise<SaleView> {
    const soldAt = this.clock.now();
    const receipt = await this.market.sale(playerId, (facts) =>
      decideSale(facts, soldAt),
    );
    return {
      id: receipt.id,
      clubId: receipt.clubId,
      playerId: receipt.playerId,
      playerName: receipt.playerName,
      value: receipt.value.amount,
      fee: receipt.fee.amount,
      penalty: receipt.penalty.amount,
      profit: receipt.profit.amount,
      cashChange: receipt.cashChange.amount,
      createdAt: receipt.createdAt,
      purchaseValue: receipt.purchaseValue.amount,
      remainingDays: receipt.remainingDays,
      penaltyRate: receipt.penaltyRate,
      contractStatus: receipt.contractStatus,
      clubCash: receipt.clubCash.amount,
    };
  }
}
