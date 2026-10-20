import type { Condition, Position } from '../../domain/types/player-types.js';

/// Limites aplicados quando só uma das pontas da faixa é informada.
export const AGE_RANGE = { min: 16, max: 45 } as const;
export const VALUE_RANGE = { min: 0, max: 550 } as const;

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
