import { Inject, Injectable } from '@nestjs/common';
import { Player } from '../domain/player.js';
import type { Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { requireActivePlayer } from './require-active-player.js';

@Injectable()
export class FindPlayer {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  execute(id: number): Promise<Player> {
    return requireActivePlayer(this.players, id);
  }
}
