import type { Player } from '../../domain/entities/player.js';

export const PLAYERS_REPOSITORY = Symbol('PLAYERS_REPOSITORY');

export interface PlayersRepository {
  add(player: Player): Promise<Player>;
  findActiveById(id: number): Promise<Player | null>;
  findActive(): Promise<Player[]>;
  save(player: Player): Promise<void>;
}
