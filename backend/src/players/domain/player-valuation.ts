import { Money, roundHalfAway } from '../../shared/domain/money.js';
import { Condition, PlayerSkills, Position } from './player-types.js';

const attributes = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

type Attribute = (typeof attributes)[number];

const weights: Record<Position, Record<Attribute, number>> = {
  GOL: {
    pace: 10,
    shooting: 0,
    passing: 20,
    dribbling: 0,
    defending: 40,
    physical: 30,
  },
  ZAG: {
    pace: 10,
    shooting: 0,
    passing: 15,
    dribbling: 0,
    defending: 45,
    physical: 30,
  },
  LAT: {
    pace: 25,
    shooting: 0,
    passing: 20,
    dribbling: 15,
    defending: 25,
    physical: 15,
  },
  MEI: {
    pace: 10,
    shooting: 15,
    passing: 35,
    dribbling: 25,
    defending: 5,
    physical: 10,
  },
  ATA: {
    pace: 20,
    shooting: 40,
    passing: 10,
    dribbling: 20,
    defending: 0,
    physical: 10,
  },
};

export function overallOf(position: Position, skills: PlayerSkills): number {
  const weight = weights[position];
  const weighted = attributes.reduce(
    (sum, attribute) => sum + skills[attribute] * weight[attribute],
    0,
  );

  return roundHalfAway(weighted, 100);
}

export function baseValueOf(
  overall: number,
  potential: number,
  ageAtRegistration: number,
): Money {
  const firstBand = Math.min(Math.max(overall - 40, 0), 20);
  const secondBand = Math.min(Math.max(overall - 60, 0), 15);
  const thirdBand = Math.min(Math.max(overall - 75, 0), 24);
  let numerator = firstBand * 50 + secondBand * 200 + thirdBand * 600;
  let denominator = 1;
  if (ageAtRegistration <= 21) {
    numerator *= 100 + potential - overall;
    denominator = 100;
  }

  return atLeastOneCoin(Money.fromRoundedRatio(numerator, denominator));
}

export function marketValueOf(
  baseValue: Money,
  condition: Condition,
  agility: number,
  age: number,
): Money {
  let totalTenths =
    ageTenths(age) - conditionDiscountTenths(condition, agility);
  if (totalTenths < -400) {
    totalTenths = -400;
  }

  return atLeastOneCoin(
    Money.fromRoundedRatio(baseValue.cents * (1000 + totalTenths), 1000),
  );
}

function atLeastOneCoin(value: Money): Money {
  return value.cents < 100 ? Money.fromCents(100) : value;
}

function conditionDiscountTenths(
  condition: Condition,
  agility: number,
): number {
  if (condition === 'APTO') {
    return 0;
  }

  let tenths = condition === 'MAL_CONDICIONADO' ? 150 : 300;
  if (agility >= 80) {
    tenths /= 2;
  } else if (agility <= 30) {
    tenths += 100;
  }

  return tenths;
}

function ageTenths(age: number): number {
  if (age <= 21) {
    return 100;
  }
  if (age >= 32) {
    return -100;
  }
  return 0;
}
