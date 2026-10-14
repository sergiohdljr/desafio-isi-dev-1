import { Inject, Injectable } from '@nestjs/common';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { playerViewOf, type PlayerView } from '../read-models/player-view.js';
import { requireActivePlayer } from '../services/require-active-player.js';

export const FIND_PLAYER = Symbol('FIND_PLAYER');

export interface FindPlayerPort {
  execute(id: number): Promise<PlayerView>;
}

@Injectable()
export class FindPlayer implements FindPlayerPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(id: number): Promise<PlayerView> {
    return playerViewOf(await requireActivePlayer(this.players, id));
  }
}
