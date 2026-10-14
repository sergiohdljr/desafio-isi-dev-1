import { Inject, Injectable } from '@nestjs/common';
import { Player, RevisePlayer } from '../domain/player.js';
import type { Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { requireActivePlayer } from './require-active-player.js';

@Injectable()
export class UpdatePlayer {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(id: number, input: RevisePlayer): Promise<Player> {
    const player = await requireActivePlayer(this.players, id);
    player.revise(input);
    await this.players.save(player);
    return player;
  }
}
