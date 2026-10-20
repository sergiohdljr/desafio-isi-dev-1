import type { Player } from '../../domain/entities/player.js';
import type { PlayerListPage } from '../queries/player-list.js';
import type { PlayerListQuery } from '../queries/player-list-query.js';

export const PLAYERS_REPOSITORY = Symbol('PLAYERS_REPOSITORY');

export interface PlayersRepository {
  add(player: Player): Promise<Player>;
  findActiveById(id: number): Promise<Player | null>;
  findActivePage(query: PlayerListQuery): Promise<PlayerListPage>;
  save(player: Player): Promise<void>;
}
