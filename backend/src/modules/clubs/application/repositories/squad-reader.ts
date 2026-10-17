import type { Player } from '../../../players/domain/entities/player.js';
import type { Money } from '../../../../shared/domain/money.js';

export const SQUAD_READER = Symbol('SQUAD_READER');

export type SquadMember = {
  clubId: number;
  player: Player;
  purchaseValue: Money;
  loyaltyUntil: Date;
};

export interface SquadReader {
  list(): Promise<SquadMember[]>;
}
