import { Inject, Injectable } from '@nestjs/common';
import { type RevisePlayer } from '../domain/player.js';
import { type Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { playerViewOf, type PlayerView } from './player-view.js';
import { requireActivePlayer } from './require-active-player.js';

export const UPDATE_PLAYER = Symbol('UPDATE_PLAYER');

export interface UpdatePlayerPort {
  execute(id: number, input: RevisePlayer): Promise<PlayerView>;
}

@Injectable()
export class UpdatePlayer implements UpdatePlayerPort {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(id: number, input: RevisePlayer): Promise<PlayerView> {
    const player = await requireActivePlayer(this.players, id);
    player.revise(input);
    await this.players.save(player);
    return playerViewOf(player);
  }
}
