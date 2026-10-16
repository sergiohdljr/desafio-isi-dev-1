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

describe('arrangePlayers', () => {
  it.each(pages)(
    'pages $matched players with limit $limit page $page',
    ({ matched, limit, page, items, first, last, totalItems, totalPages }) => {
      const query: PlayerListQuery = { sorts: ['name'], page, limit };
      const result = arrangePlayers(roster(matched), query);

      expect(result.data).toHaveLength(items);
      expect(result.data[0]?.name).toBe(first);
      expect(result.data.at(-1)?.name).toBe(last);
      expect(result.meta).toEqual({ page, limit, totalItems, totalPages });
    },
  );
});
