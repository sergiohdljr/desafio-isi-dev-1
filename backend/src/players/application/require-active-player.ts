import { DomainError } from '../../shared/domain/domain-error.js';
import { Player } from '../domain/player.js';
import type { Players } from '../domain/players.js';

export async function requireActivePlayer(
  players: Players,
  id: number,
): Promise<Player> {
  const player = await players.findActiveById(id);
  if (!player) {
    throw new DomainError('missing', 'Jogador não encontrado');
  }
  return player;
}
