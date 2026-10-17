import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../../common/clock/clock.js';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { InMemoryMarketRepository } from '../../infra/memory/in-memory-market-repository.js';
import { MARKET_REPOSITORY } from '../repositories/market-repository.js';
import { BuyPlayer } from './buy-player.use-case.js';

const boughtAt = new Date('2026-10-14T15:00:00.000Z');
const loyaltyUntil = new Date('2027-03-02T13:15:00.000Z');

function marketWith(player: { id: number; name: string } | null) {
  return new InMemoryMarketRepository(
    player
      ? [
          {
            id: player.id,
            name: player.name,
            clubId: null,
            marketValue: Money.fromCents(4000),
          },
        ]
      : [],
    [{ id: 3, cash: Money.fromCents(30000) }],
  );
}

describe('buy player', () => {
  it('returns the purchase, the active contract and the cash left', async () => {
    const market = marketWith({ id: 7, name: 'Meia Lua' });
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
      id: 1,
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
    expect(market.writes).toHaveLength(1);
  });

  it('does not record a purchase when the player is missing', async () => {
    const market = marketWith(null);
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
    expect(market.writes).toHaveLength(0);
  });
});
