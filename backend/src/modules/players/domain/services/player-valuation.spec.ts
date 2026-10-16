import { Money } from '../../../../shared/domain/money.js';
import type { Condition, PlayerSkills, Position } from '../types/player-types.js';
import { baseValueOf, marketValueOf, overallOf } from './player-valuation.js';

type MarketCase = {
  base: string;
  condition: Condition;
  agility: number;
  age: number;
  market: string;
};

const cases: MarketCase[] = [
  { base: '82.00', condition: 'APTO', agility: 20, age: 25, market: '82.00' },
  { base: '82.00', condition: 'APTO', agility: 50, age: 19, market: '90.20' },
  {
    base: '82.00',
    condition: 'MAL_CONDICIONADO',
    agility: 50,
    age: 25,
    market: '69.70',
  },
  {
    base: '82.00',
    condition: 'MAL_CONDICIONADO',
    agility: 80,
    age: 21,
    market: '84.05',
  },
  {
    base: '82.00',
    condition: 'MAL_CONDICIONADO',
    agility: 30,
    age: 33,
    market: '53.30',
  },
  { base: '82.00', condition: 'DOENTE', agility: 90, age: 25, market: '69.70' },
  { base: '82.00', condition: 'DOENTE', agility: 30, age: 25, market: '49.20' },
  { base: '82.00', condition: 'DOENTE', agility: 10, age: 40, market: '49.20' },
  {
    base: '9.50',
    condition: 'MAL_CONDICIONADO',
    agility: 85,
    age: 25,
    market: '8.79',
  },
  {
    base: '1.00',
    condition: 'MAL_CONDICIONADO',
    agility: 50,
    age: 35,
    market: '1.00',
  },
];

type OverallCase = PlayerSkills & {
  position: Position;
  overall: number;
};

const overallCases: OverallCase[] = [
  {
    position: 'MEI',
    pace: 68,
    shooting: 65,
    passing: 80,
    dribbling: 78,
    defending: 52,
    physical: 60,
    overall: 73,
  },
  {
    position: 'ATA',
    pace: 78,
    shooting: 75,
    passing: 73,
    dribbling: 82,
    defending: 48,
    physical: 68,
    overall: 76,
  },
  {
    position: 'LAT',
    pace: 72,
    shooting: 70,
    passing: 78,
    dribbling: 76,
    defending: 70,
    physical: 66,
    overall: 72,
  },
  {
    position: 'ZAG',
    pace: 50,
    shooting: 90,
    passing: 60,
    dribbling: 40,
    defending: 80,
    physical: 75,
    overall: 73,
  },
  {
    position: 'GOL',
    pace: 55,
    shooting: 30,
    passing: 65,
    dribbling: 40,
    defending: 72,
    physical: 68,
    overall: 68,
  },
];

type BaseCase = {
  overall: number;
  potential: number;
  age: number;
  base: string;
};

const baseCases: BaseCase[] = [
  { overall: 75, potential: 86, age: 25, base: '40.00' },
  { overall: 60, potential: 70, age: 30, base: '10.00' },
  { overall: 61, potential: 70, age: 30, base: '12.00' },
  { overall: 76, potential: 80, age: 22, base: '46.00' },
  { overall: 85, potential: 92, age: 27, base: '100.00' },
  { overall: 70, potential: 84, age: 21, base: '34.20' },
  { overall: 70, potential: 84, age: 22, base: '30.00' },
  { overall: 45, potential: 90, age: 18, base: '3.63' },
  { overall: 40, potential: 66, age: 36, base: '1.00' },
];

describe('overallOf', () => {
  it.each(overallCases)(
    'rates a $position as $overall',
    ({ position, overall, ...skills }) => {
      expect(overallOf(position, skills)).toBe(overall);
    },
  );
});

describe('baseValueOf', () => {
  it.each(baseCases)(
    'prices overall $overall potential $potential age $age as $base',
    ({ overall, potential, age, base }) => {
      expect(baseValueOf(overall, potential, age).toDecimalString()).toBe(base);
    },
  );
});

describe('marketValueOf', () => {
  it.each(cases)(
    'prices $base $condition agility $agility age $age as $market',
    ({ base, condition, agility, age, market }) => {
      const value = marketValueOf(
        Money.roundHalfAwayFromZero(base),
        condition,
        agility,
        age,
      );

      expect(value.toDecimalString()).toBe(market);
    },
  );
});
