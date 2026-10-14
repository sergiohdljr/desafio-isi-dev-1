import { Player } from '../../domain/entities/player.js';
import { Position } from '../../domain/types/player-types.js';
import { PlayerListQuery, PlayerSort } from './player-list-query.js';

const positionOrder: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
};

export type PlayerListPage = {
  data: Player[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export function arrangePlayers(
  players: Player[],
  query: PlayerListQuery,
): PlayerListPage {
  const matched = players
    .filter((player) => matches(player, query))
    .sort((left, right) => comparePlayers(left, right, query.sorts));
  const totalItems = matched.length;
  const start = (query.page - 1) * query.limit;

  return {
    data: matched.slice(start, start + query.limit),
    meta: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / query.limit),
    },
  };
}

function matches(player: Player, query: PlayerListQuery): boolean {
  if (
    query.search !== undefined &&
    !foldName(player.name).includes(foldName(query.search))
  ) {
    return false;
  }
  if (query.position !== undefined && player.position !== query.position) {
    return false;
  }
  if (query.condition !== undefined && player.condition !== query.condition) {
    return false;
  }
  if (query.free === true && player.clubId !== null) {
    return false;
  }
  if (query.free === false && player.clubId === null) {
    return false;
  }
  if (query.clubId !== undefined && player.clubId !== query.clubId) {
    return false;
  }
  if (query.minAge !== undefined || query.maxAge !== undefined) {
    const minAge = query.minAge ?? 16;
    const maxAge = query.maxAge ?? 45;
    if (player.age < minAge || player.age > maxAge) {
      return false;
    }
  }
  if (query.minValue !== undefined || query.maxValue !== undefined) {
    const minValue = cents(query.minValue ?? 0);
    const maxValue = cents(query.maxValue ?? 550);
    if (
      player.marketValue.cents < minValue ||
      player.marketValue.cents > maxValue
    ) {
      return false;
    }
  }

  return true;
}

function comparePlayers(
  left: Player,
  right: Player,
  sorts: PlayerSort[],
): number {
  for (const sort of sorts) {
    const difference = compareBy(left, right, sort);
    if (difference !== 0) {
      return difference;
    }
  }

  const byName = compareNames(left.name, right.name);
  if (byName !== 0) {
    return byName;
  }

  return left.id - right.id;
}

function compareBy(left: Player, right: Player, sort: PlayerSort): number {
  switch (sort) {
    case 'name':
      return compareNames(left.name, right.name);
    case 'value_asc':
      return left.marketValue.cents - right.marketValue.cents;
    case 'value_desc':
      return right.marketValue.cents - left.marketValue.cents;
    case 'age_asc':
      return left.age - right.age;
    case 'age_desc':
      return right.age - left.age;
    case 'position':
      return positionOrder[left.position] - positionOrder[right.position];
  }
}

function compareNames(left: string, right: string): number {
  const foldedLeft = foldName(left);
  const foldedRight = foldName(right);
  if (foldedLeft < foldedRight) {
    return -1;
  }
  if (foldedLeft > foldedRight) {
    return 1;
  }
  return 0;
}

function foldName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}

function cents(value: number): number {
  return Math.round(value * 100);
}
