import { Condition, Position } from '../../domain/entities/player-types.js';

export type PlayerSort =
  'name' | 'value_asc' | 'value_desc' | 'age_asc' | 'age_desc' | 'position';

export type PlayerListQuery = {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
  minValue?: number;
  maxValue?: number;
  sorts: PlayerSort[];
  page: number;
  limit: number;
};
