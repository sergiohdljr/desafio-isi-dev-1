import { Inject, Injectable } from '@nestjs/common';
import { Condition, Player } from '../domain/player.js';
import type { Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { requireActivePlayer } from './require-active-player.js';

@Injectable()
export class ChangePlayerCondition {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(id: number, condition: Condition): Promise<Player> {
    const player = await requireActivePlayer(this.players, id);
    if (player.changeCondition(condition)) {
      await this.players.save(player);
    }
    return player;
  }
}
