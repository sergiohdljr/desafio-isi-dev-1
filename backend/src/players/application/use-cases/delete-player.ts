import { Inject, Injectable } from '@nestjs/common';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { requireActivePlayer } from './require-active-player.js';

export const DELETE_PLAYER = Symbol('DELETE_PLAYER');

export interface DeletePlayerPort {
  execute(id: number): Promise<void>;
}

@Injectable()
export class DeletePlayer implements DeletePlayerPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const player = await requireActivePlayer(this.players, id);
    player.exclude();
    await this.players.save(player);
  }
}
