import { Player } from './player.js';

export interface Players {
  add(player: Player): Promise<Player>;
  findActiveById(id: number): Promise<Player | null>;
  findActive(): Promise<Player[]>;
  clubExists(id: number): Promise<boolean>;
  save(player: Player): Promise<void>;
}
