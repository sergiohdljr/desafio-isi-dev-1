import { Player } from '../../domain/entities/player.js';
import { Condition, Position } from '../../domain/types/player-types.js';

export type PlayerView = {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  baseValue: number;
  marketValue: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  clubId: number | null;
};

export type PlayerListView = {
  data: PlayerView[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export function playerViewOf(player: Player): PlayerView {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
    condition: player.condition,
    baseValue: player.baseValue.amount,
    marketValue: player.marketValue.amount,
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall: player.overall,
    clubId: player.clubId,
  };
}
