import { Money } from '../../../../shared/domain/money.js';

export const MAX_CLUBS = 20;
const INITIAL_CASH_CENTS = 30_000;

export type ClubState = {
  id: number;
  name: string;
  acronym: string;
  cash: Money;
};

export class Club {
  private constructor(
    private readonly clubId: number | null,
    private readonly _name: string,
    private readonly _acronym: string,
    private readonly _cash: Money,
  ) {}

  static open(name: string, acronym: string): Club {
    return new Club(null, name, acronym, Money.fromCents(INITIAL_CASH_CENTS));
  }

  static reconstitute(state: ClubState): Club {
    return new Club(state.id, state.name, state.acronym, state.cash);
  }

  get id(): number {
    if (this.clubId === null) {
      throw new Error('Clube ainda não persistido');
    }
    return this.clubId;
  }

  get name(): string {
    return this._name;
  }

  get acronym(): string {
    return this._acronym;
  }

  get cash(): Money {
    return this._cash;
  }
}
