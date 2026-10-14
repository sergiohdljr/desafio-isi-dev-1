import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../clubs/application/clock.js';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../policies/decide-purchase.js';
import {
  MARKET_REPOSITORY,
  type MarketRepository,
  type PurchaseReceipt,
} from '../repositories/market-repository.js';
import { BuyPlayer } from './buy-player.use-case.js';

const boughtAt = new Date('2026-10-14T15:00:00.000Z');
const loyaltyUntil = new Date('2027-03-02T13:15:00.000Z');

function repository(initial: PurchaseFacts) {
  const stored: PurchaseWrite[] = [];
  const market: MarketRepository = {
    async purchase(_playerId, _clubId, settle) {
      const write = settle(initial);
      stored.push(write);
      const clubCash = Money.fromCents(
        (initial.club?.cash.cents ?? 0) + write.cashChange.cents,
      );
      const receipt: PurchaseReceipt = {
        id: 11,
        clubId: initial.club?.id ?? 0,
        playerId: initial.player?.id ?? 0,
        playerName: write.playerName,
        value: write.value,
        fee: write.fee,
        cashChange: write.cashChange,
        createdAt: write.at,
        loyaltyUntil: write.loyaltyUntil,
        clubCash,
      };
      return receipt;
    },
    async sale() {
      throw new Error('venda fora deste teste');
    },
    async list() {
      throw new Error('histórico fora deste teste');
    },
  };
  return { market, stored };
}

describe('buy player', () => {
  it('returns the purchase, the active contract and the cash left', async () => {
    const { market, stored } = repository({
      player: {
        id: 7,
        name: 'Meia Lua',
        clubId: null,
        marketValue: Money.fromCents(4000),
      },
      club: { id: 3, cash: Money.fromCents(30000), squadSize: 0 },
      previouslySoldByClub: false,
    });
    const module = await Test.createTestingModule({
      providers: [
        BuyPlayer,
        { provide: MARKET_REPOSITORY, useValue: market },
        { provide: CLOCK, useValue: { now: () => boughtAt } },
      ],
    }).compile();

    const bought = await module.get(BuyPlayer).execute({
      playerId: 7,
      clubId: 3,
      loyaltyUntil,
    });

    expect(bought).toEqual({
      id: 11,
      clubId: 3,
      playerId: 7,
      playerName: 'Meia Lua',
      value: 40,
      fee: 2,
      penalty: 0,
      profit: null,
      cashChange: -42,
      createdAt: boughtAt,
      loyaltyUntil,
      clubCash: 258,
    });
    expect(stored).toHaveLength(1);
  });

  it('does not record a purchase when the player is missing', async () => {
    const { market, stored } = repository({
      player: null,
      club: { id: 3, cash: Money.fromCents(30000), squadSize: 0 },
      previouslySoldByClub: false,
    });
    const module = await Test.createTestingModule({
      providers: [
        BuyPlayer,
        { provide: MARKET_REPOSITORY, useValue: market },
        { provide: CLOCK, useValue: { now: () => boughtAt } },
      ],
    }).compile();

    await expect(
      module.get(BuyPlayer).execute({
        playerId: 7,
        clubId: 3,
        loyaltyUntil,
      }),
    ).rejects.toBeInstanceOf(DomainError);
    expect(stored).toHaveLength(0);
  });
});
