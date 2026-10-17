import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../../common/clock/clock.js';
import { decidePurchase } from '../policies/decide-purchase.js';
import {
  MARKET_REPOSITORY,
  type MarketRepository,
  type PurchaseReceipt,
} from '../repositories/market-repository.js';

export const BUY_PLAYER = Symbol('BUY_PLAYER');

export type PurchaseView = {
  id: number;
  clubId: number;
  playerId: number;
  playerName: string;
  value: number;
  fee: number;
  penalty: number;
  profit: null;
  cashChange: number;
  createdAt: Date;
  loyaltyUntil: Date;
  clubCash: number;
};

export interface BuyPlayerPort {
  execute(input: {
    playerId: number;
    clubId: number;
    loyaltyUntil: Date;
  }): Promise<PurchaseView>;
}

@Injectable()
export class BuyPlayer implements BuyPlayerPort {
  constructor(
    @Inject(MARKET_REPOSITORY) private readonly market: MarketRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(input: {
    playerId: number;
    clubId: number;
    loyaltyUntil: Date;
  }): Promise<PurchaseView> {
    const boughtAt = this.clock.now();
    const receipt = await this.market.purchase(
      input.playerId,
      input.clubId,
      (facts) => decidePurchase(facts, input.loyaltyUntil, boughtAt),
    );
    return viewOf(receipt);
  }
}

function viewOf(receipt: PurchaseReceipt): PurchaseView {
  return {
    id: receipt.id,
    clubId: receipt.clubId,
    playerId: receipt.playerId,
    playerName: receipt.playerName,
    value: receipt.value.amount,
    fee: receipt.fee.amount,
    penalty: 0,
    profit: null,
    cashChange: receipt.cashChange.amount,
    createdAt: receipt.createdAt,
    loyaltyUntil: receipt.loyaltyUntil,
    clubCash: receipt.clubCash.amount,
  };
}
