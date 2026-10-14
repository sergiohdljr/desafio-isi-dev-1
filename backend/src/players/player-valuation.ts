import { condicao, posicao, Prisma } from '../generated/prisma/client.js';

const attributes = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

type Attribute = (typeof attributes)[number];

const weights: Record<posicao, Record<Attribute, number>> = {
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

export type PlayerAttributes = Record<Attribute, number>;

export function overallOf(position: posicao, skills: PlayerAttributes): number {
  const weight = weights[position];
  const weighted = attributes.reduce(
    (sum, attribute) =>
      sum.plus(new Prisma.Decimal(skills[attribute]).times(weight[attribute])),
    new Prisma.Decimal(0),
  );

  return weighted
    .div(100)
    .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP)
    .toNumber();
}

export function baseValueOf(
  overall: number,
  potential: number,
  ageAtRegistration: number,
): Prisma.Decimal {
  const firstBand = Math.min(Math.max(overall - 40, 0), 20);
  const secondBand = Math.min(Math.max(overall - 60, 0), 15);
  const thirdBand = Math.min(Math.max(overall - 75, 0), 24);
  let part = new Prisma.Decimal(firstBand)
    .times('0.50')
    .plus(new Prisma.Decimal(secondBand).times(2))
    .plus(new Prisma.Decimal(thirdBand).times(6));

  if (ageAtRegistration <= 21) {
    part = part.times(new Prisma.Decimal(100 + potential - overall).div(100));
  }

  const rounded = part.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  return rounded.lessThan(1) ? new Prisma.Decimal(1) : rounded;
}

export function marketValueOf(
  baseValue: Prisma.Decimal,
  condition: condicao,
  agility: number,
  age: number,
): Prisma.Decimal {
  const discount = conditionDiscount(condition, agility);
  let total = ageAdjustment(age).minus(discount);
  if (total.lessThan(-40)) {
    total = new Prisma.Decimal(-40);
  }

  const value = baseValue
    .times(total.plus(100))
    .div(100)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  return value.lessThan(1) ? new Prisma.Decimal(1) : value;
}

function conditionDiscount(
  condition: condicao,
  agility: number,
): Prisma.Decimal {
  if (condition === condicao.APTO) {
    return new Prisma.Decimal(0);
  }

  let discount = new Prisma.Decimal(
    condition === condicao.MAL_CONDICIONADO ? 15 : 30,
  );
  if (agility >= 80) {
    discount = discount.div(2);
  } else if (agility <= 30) {
    discount = discount.plus(10);
  }

  return discount;
}

function ageAdjustment(age: number): Prisma.Decimal {
  if (age <= 21) {
    return new Prisma.Decimal(10);
  }
  if (age >= 32) {
    return new Prisma.Decimal(-10);
  }
  return new Prisma.Decimal(0);
}
