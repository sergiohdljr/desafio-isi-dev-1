import { Inject, Injectable } from '@nestjs/common';
import { type RevisePlayer } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { playerViewOf, type PlayerView } from './player-view.js';
import { requireActivePlayer } from './require-active-player.js';

export const UPDATE_PLAYER = Symbol('UPDATE_PLAYER');

export interface UpdatePlayerPort {
  execute(id: number, input: RevisePlayer): Promise<PlayerView>;
}

@Injectable()
export class UpdatePlayer implements UpdatePlayerPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(id: number, input: RevisePlayer): Promise<PlayerView> {
    const player = await requireActivePlayer(this.players, id);
    player.revise(input);
    await this.players.save(player);
    return playerViewOf(player);
  }
}
