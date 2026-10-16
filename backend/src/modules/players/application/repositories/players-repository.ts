import type { Player } from '../../domain/entities/player.js';

export const PLAYERS_REPOSITORY = Symbol('PLAYERS_REPOSITORY');

export interface PlayersRepository {
  add(player: Player): Promise<Player>;
  findActiveById(id: number): Promise<Player | null>;
  findActive(): Promise<Player[]>;
  clubExists(id: number): Promise<boolean>;
  save(player: Player): Promise<void>;
}
