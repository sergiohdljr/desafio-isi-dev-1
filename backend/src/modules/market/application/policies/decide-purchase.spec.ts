import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import {
  decidePurchase,
  type PurchaseClub,
  type PurchaseFacts,
  type PurchasePlayer,
} from './decide-purchase.js';

const boughtAt = new Date('2026-10-14T15:00:00.000Z');
const loyaltyUntil = new Date('2027-03-02T13:15:00.000Z');

function player(cents: number, clubId: number | null = null): PurchasePlayer {
  return {
    id: 7,
    name: 'Meia Lua',
    clubId,
    marketValue: Money.fromCents(cents),
  };
}

function club(cents: number, squadSize = 0): PurchaseClub {
  return { id: 3, cash: Money.fromCents(cents), squadSize };
}

function facts(
  marketCents: number,
  cashCents: number,
  overrides: Partial<PurchaseFacts> = {},
): PurchaseFacts {
  return {
    player: player(marketCents),
    club: club(cashCents),
    previouslySoldByClub: false,
    ...overrides,
  };
}

describe('decide purchase', () => {
  it('debits market value plus the fee and keeps the contract purchase at market value', () => {
    expect(
      decidePurchase(facts(2800, 30000), loyaltyUntil, boughtAt),
    ).toMatchObject({
      playerName: 'Meia Lua',
      value: Money.fromCents(2800),
      fee: Money.fromCents(0),
      cashChange: Money.fromCents(-2800),
    });

    expect(
      decidePurchase(facts(3000, 30000), loyaltyUntil, boughtAt).fee.cents,
    ).toBe(0);

    const aboveThirty = decidePurchase(
      facts(3001, 30000),
      loyaltyUntil,
      boughtAt,
    );
    expect(aboveThirty.fee.cents).toBe(150);
    expect(aboveThirty.cashChange.cents).toBe(-3151);

    const atTheLimit = decidePurchase(
      facts(4762, 10000),
      loyaltyUntil,
      boughtAt,
    );
    expect(atTheLimit.fee.cents).toBe(238);
    expect(atTheLimit.cashChange.cents).toBe(-5000);
  });

  it('refuses a missing player or club and a loyalty outside the window', () => {
    expect(() =>
      decidePurchase(
        facts(2800, 30000, { player: null }),
        loyaltyUntil,
        boughtAt,
      ),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(
        facts(2800, 30000, { club: null }),
        loyaltyUntil,
        boughtAt,
      ),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(facts(2800, 30000), boughtAt, boughtAt),
    ).toThrow(DomainError);
  });

  it('refuses a player who already has a club, a 13th squad place, or a cost above half the cash', () => {
    expect(() =>
      decidePurchase(
        facts(2800, 30000, { player: player(2800, 9) }),
        loyaltyUntil,
        boughtAt,
      ),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(
        {
          player: player(100),
          club: club(30000, 12),
          previouslySoldByClub: false,
        },
        loyaltyUntil,
        boughtAt,
      ),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(
        {
          player: player(100),
          club: club(30000, 11),
          previouslySoldByClub: false,
        },
        loyaltyUntil,
        boughtAt,
      ),
    ).not.toThrow();
    expect(() =>
      decidePurchase(facts(4800, 10000), loyaltyUntil, boughtAt),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(facts(12436, 26115), loyaltyUntil, boughtAt),
    ).toThrow(DomainError);
    expect(() =>
      decidePurchase(
        facts(2800, 30000, { previouslySoldByClub: true }),
        loyaltyUntil,
        boughtAt,
      ),
    ).toThrow(DomainError);
  });
});
