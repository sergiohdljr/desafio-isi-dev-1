import { Money } from '../../../../shared/domain/money.js';
import { Player } from '../../domain/entities/player.js';
import { arrangePlayers } from './player-list.js';
import type { PlayerListQuery } from './player-list-query.js';

const baseValue = Money.roundHalfAwayFromZero('1.00');

function roster(count: number): Player[] {
  return Array.from({ length: count }, (_, index) =>
    Player.reconstitute({
      id: count - index,
      name: `Jogador ${String(index + 1).padStart(2, '0')}`,
      position: 'MEI',
      agility: 50,
      age: 25,
      condition: 'APTO',
      baseValue,
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defending: 50,
      physical: 50,
      potential: 50,
      clubId: null,
      excluded: false,
    }),
  );
}

const pages = [
  {
    matched: 23,
    limit: 10,
    page: 1,
    items: 10,
    first: 'Jogador 01',
    last: 'Jogador 10',
    totalItems: 23,
    totalPages: 3,
  },
  {
    matched: 23,
    limit: 10,
    page: 3,
    items: 3,
    first: 'Jogador 21',
    last: 'Jogador 23',
    totalItems: 23,
    totalPages: 3,
  },
  {
    matched: 23,
    limit: 10,
    page: 4,
    items: 0,
    first: undefined,
    last: undefined,
    totalItems: 23,
    totalPages: 3,
  },
  {
    matched: 23,
    limit: 50,
    page: 1,
    items: 23,
    first: 'Jogador 01',
    last: 'Jogador 23',
    totalItems: 23,
    totalPages: 1,
  },
  {
    matched: 0,
    limit: 10,
    page: 1,
    items: 0,
    first: undefined,
    last: undefined,
    totalItems: 0,
    totalPages: 0,
  },
];

function one(input: {
  id: number;
  name: string;
  position?: Player['position'];
  condition?: Player['condition'];
  age?: number;
  clubId?: number | null;
  base?: string;
}): Player {
  return Player.reconstitute({
    id: input.id,
    name: input.name,
    position: input.position ?? 'MEI',
    agility: 50,
    age: input.age ?? 25,
    condition: input.condition ?? 'APTO',
    baseValue: Money.roundHalfAwayFromZero(input.base ?? '1.00'),
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 50,
    clubId: input.clubId ?? null,
    excluded: false,
  });
}

const page: PlayerListQuery = { sorts: ['name'], page: 1, limit: 10 };

describe('arrangePlayers', () => {
  it.each(pages)(
    'pages $matched players with limit $limit page $page',
    ({ matched, limit, page, items, first, last, totalItems, totalPages }) => {
      const query: PlayerListQuery = { sorts: ['name'], page, limit };
      const result = arrangePlayers(roster(matched), query);

      expect(result.data).toHaveLength(items);
      expect(result.data[0]?.name).toBe(first);
      expect(result.data.at(-1)?.name).toBe(last);
      expect(result.meta).toEqual({
        page,
        limit,
        totalItems,
        totalPages,
        counts: { all: totalItems, free: totalItems, signed: 0 },
      });
    },
  );

  it('filters by position, condition, club, freedom, age and value', () => {
    const players = [
      one({ id: 1, name: 'Ana', position: 'GOL', age: 18, base: '10.00' }),
      one({
        id: 2,
        name: 'Bia',
        condition: 'DOENTE',
        clubId: 4,
        age: 40,
        base: '80.00',
      }),
      one({ id: 3, name: 'Cris', clubId: 4, age: 30, base: '20.00' }),
    ];

    expect(
      arrangePlayers(players, { ...page, search: 'cr' }).data.map(
        (player) => player.id,
      ),
    ).toEqual([3]);
    expect(
      arrangePlayers(players, { ...page, position: 'GOL' }).data.map(
        (player) => player.id,
      ),
    ).toEqual([1]);
    expect(
      arrangePlayers(players, { ...page, condition: 'DOENTE' }).data.map(
        (player) => player.id,
      ),
    ).toEqual([2]);
    expect(
      arrangePlayers(players, { ...page, free: true }).data.map(
        (player) => player.id,
      ),
    ).toEqual([1]);
    expect(
      arrangePlayers(players, { ...page, free: false, clubId: 4 }).data.map(
        (player) => player.id,
      ),
    ).toEqual([2, 3]);
    expect(
      arrangePlayers(players, { ...page, minAge: 28, maxAge: 35 }).data.map(
        (player) => player.id,
      ),
    ).toEqual([3]);
    expect(
      arrangePlayers(players, { ...page, minValue: 15, maxValue: 30 }).data.map(
        (player) => player.id,
      ),
    ).toEqual([3]);
  });

  it('breaks a value tie by name and then by id', () => {
    const players = [
      one({ id: 8, name: 'Ana', base: '10.00', position: 'ATA' }),
      one({ id: 2, name: 'Ana', base: '10.00', position: 'GOL' }),
      one({ id: 5, name: 'Bia', base: '30.00' }),
    ];

    const byValue = arrangePlayers(players, {
      ...page,
      sorts: ['value_desc', 'position'],
    });
    expect(byValue.data.map((player) => player.id)).toEqual([5, 2, 8]);

    const byAge = arrangePlayers(
      [
        one({ id: 1, name: 'Nova', age: 30 }),
        one({ id: 2, name: 'Velha', age: 18 }),
      ],
      { ...page, sorts: ['age_asc'] },
    );
    expect(byAge.data.map((player) => player.name)).toEqual(['Velha', 'Nova']);

    const oldest = arrangePlayers(
      [
        one({ id: 1, name: 'Nova', age: 30 }),
        one({ id: 2, name: 'Velha', age: 18 }),
      ],
      { ...page, sorts: ['age_desc', 'value_asc'] },
    );
    expect(oldest.data.map((player) => player.name)).toEqual(['Nova', 'Velha']);
  });
});
