import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { decideSale, type SaleFacts } from './decide-sale.js';

const soldAt = new Date('2026-11-05T19:40:00.000Z');

function owned(marketCents: number): SaleFacts {
  return {
    player: {
      id: 7,
      name: 'Meia Lua',
      clubId: 3,
      marketValue: Money.fromCents(marketCents),
    },
    clubCash: Money.fromCents(27500),
    contract: {
      purchaseValue: Money.fromCents(2500),
      loyaltyUntil: new Date(soldAt.getTime() - 1000),
    },
  };
}

describe('decide sale', () => {
  it('credits the market value when loyalty is already over', () => {
    const write = decideSale(owned(2500), soldAt);
    expect(write.cashChange.cents).toBe(2500);
    expect(write.fee.cents).toBe(0);
    expect(write.penalty.cents).toBe(0);
    expect(write.contractStatus).toBe('ENCERRADO');
    expect(write.clubId).toBe(3);
  });

  it('refuses a missing player and a free player', () => {
    expect(() => decideSale({ ...owned(2500), player: null }, soldAt)).toThrow(
      DomainError,
    );
    expect(() =>
      decideSale(
        {
          ...owned(2500),
          player: { ...owned(2500).player!, clubId: null },
          clubCash: null,
          contract: null,
        },
        soldAt,
      ),
    ).toThrow(DomainError);
  });

  it('refuses a club player without an active contract', () => {
    expect(() =>
      decideSale({ ...owned(2500), contract: null }, soldAt),
    ).toThrow(DomainError);
  });
});
