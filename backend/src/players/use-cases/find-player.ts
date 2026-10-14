import { Inject, Injectable } from '@nestjs/common';
import { type Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { requireActivePlayer } from './require-active-player.js';
import { playerViewOf, type PlayerView } from './player-view.js';

export const FIND_PLAYER = Symbol('FIND_PLAYER');

export interface FindPlayerPort {
  execute(id: number): Promise<PlayerView>;
}

@Injectable()
export class FindPlayer implements FindPlayerPort {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(id: number): Promise<PlayerView> {
    return playerViewOf(await requireActivePlayer(this.players, id));
  }
}
