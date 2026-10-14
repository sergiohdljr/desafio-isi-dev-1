import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Player } from '../../domain/entities/player.js';
import type { PlayersRepository } from '../repositories/players-repository.js';

export async function requireActivePlayer(
  players: PlayersRepository,
  id: number,
): Promise<Player> {
  const player = await players.findActiveById(id);
  if (!player) {
    throw new DomainError('missing', 'Jogador não encontrado');
  }
  return player;
}
