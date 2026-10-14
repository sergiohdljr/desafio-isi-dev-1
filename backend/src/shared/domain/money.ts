export class Money {
  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static roundHalfAwayFromZero(value: string): Money {
    const negative = value.startsWith('-');
    const unsigned = negative ? value.slice(1) : value;
    const [whole = '0', fraction = ''] = unsigned.split('.');
    const digits = `${fraction}000`.slice(0, 3);
    let cents = Number(whole) * 100 + Number(digits.slice(0, 2));
    if (Number(digits[2]) >= 5) {
      cents += 1;
    }

    return new Money(negative ? -cents : cents);
  }

  static fromRoundedRatio(numerator: number, denominator: number): Money {
    return new Money(roundHalfAway(numerator, denominator));
  }

  get amount(): number {
    return this.cents / 100;
  }

  toDecimalString(): string {
    const negative = this.cents < 0;
    const absolute = Math.abs(this.cents);
    const whole = Math.floor(absolute / 100);
    const fraction = String(absolute % 100).padStart(2, '0');
    return `${negative ? '-' : ''}${whole}.${fraction}`;
  }
}

export function roundHalfAway(numerator: number, denominator: number): number {
  const negative = numerator < 0 !== denominator < 0;
  const absoluteNumerator = Math.abs(numerator);
  const absoluteDenominator = Math.abs(denominator);
  const quotient = Math.floor(absoluteNumerator / absoluteDenominator);
  const remainder = absoluteNumerator % absoluteDenominator;
  const rounded =
    remainder * 2 >= absoluteDenominator ? quotient + 1 : quotient;
  return negative ? -rounded : rounded;
}
