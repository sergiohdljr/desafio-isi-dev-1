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
  listByClub(clubId: number): Promise<SquadMember[]>;
  /// Valor de elenco de cada clube que tem jogadores, agregado no banco.
  squadValues(): Promise<Map<number, Money>>;
}
