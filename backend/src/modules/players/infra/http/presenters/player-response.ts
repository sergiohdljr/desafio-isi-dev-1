import type { Condition, Position } from '../../../domain/types/player-types.js';
import type {
  PlayerListView,
  PlayerView,
} from '../../../application/read-models/player-view.js';

export type PlayerResponse = {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
};

export function presentPlayer(view: PlayerView): PlayerResponse {
  return {
    id: view.id,
    name: view.name,
    position: view.position,
    agility: view.agility,
    age: view.age,
    condition: view.condition,
    base_value: view.baseValue,
    market_value: view.marketValue,
    pace: view.pace,
    shooting: view.shooting,
    passing: view.passing,
    dribbling: view.dribbling,
    defending: view.defending,
    physical: view.physical,
    potential: view.potential,
    overall: view.overall,
    club_id: view.clubId,
  };
}

export function presentPlayerList(page: PlayerListView): {
  data: PlayerResponse[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
} {
  return {
    data: page.data.map(presentPlayer),
    meta: {
      page: page.meta.page,
      limit: page.meta.limit,
      total_items: page.meta.totalItems,
      total_pages: page.meta.totalPages,
    },
  };
}
