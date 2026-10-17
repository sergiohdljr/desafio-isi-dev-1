import { Test } from '@nestjs/testing';
import { CLOCK } from '../../../../../common/clock/clock.js';
import { DomainError } from '../../../../../shared/domain/domain-error.js';
import { Money } from '../../../../../shared/domain/money.js';
import { InMemoryMarketRepository } from '../../../infra/repositories/in-memory-market-repository.js';
import { MARKET_REPOSITORY } from '../../repositories/market-repository.js';
import { SellPlayer } from '../sell-player.use-case.js';

const soldAt = new Date('2026-11-05T19:40:00.000Z');

function marketWith(clubId: number | null) {
  return new InMemoryMarketRepository(
    [
      {
        id: 7,
        name: 'Meia Lua',
        clubId,
        marketValue: Money.fromCents(4000),
        contract:
          clubId === null
            ? null
            : {
                purchaseValue: Money.fromCents(2500),
                loyaltyUntil: new Date(soldAt.getTime() - 1000),
              },
      },
    ],
    [{ id: 3, cash: Money.fromCents(30000) }],
  );
}

describe('sell player', () => {
  it('records the sale and credits the club cash', async () => {
    const market = marketWith(3);
    const module = await Test.createTestingModule({
      providers: [
        SellPlayer,
        { provide: MARKET_REPOSITORY, useValue: market },
        { provide: CLOCK, useValue: { now: () => soldAt } },
      ],
    }).compile();

    const sold = await module.get(SellPlayer).execute(7);

    expect(sold).toMatchObject({
      id: 1,
      clubId: 3,
      playerId: 7,
      playerName: 'Meia Lua',
      value: 40,
      fee: 2,
      penalty: 0,
      profit: 15,
      cashChange: 38,
      contractStatus: 'ENCERRADO',
      clubCash: 338,
    });
    expect(market.writes).toHaveLength(1);
  });

  it('does not record a sale of a free player', async () => {
    const market = marketWith(null);
    const module = await Test.createTestingModule({
      providers: [
        SellPlayer,
        { provide: MARKET_REPOSITORY, useValue: market },
        { provide: CLOCK, useValue: { now: () => soldAt } },
      ],
    }).compile();

    await expect(module.get(SellPlayer).execute(7)).rejects.toBeInstanceOf(
      DomainError,
    );
    expect(market.writes).toHaveLength(0);
  });
});
