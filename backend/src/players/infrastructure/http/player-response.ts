import { Player } from '../../domain/player.js';
import { Condition, Position } from '../../domain/player-types.js';

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

export function toPlayerResponse(player: Player): PlayerResponse {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
    condition: player.condition,
    base_value: player.baseValue.amount,
    market_value: player.marketValue.amount,
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall: player.overall,
    club_id: player.clubId,
  };
}
