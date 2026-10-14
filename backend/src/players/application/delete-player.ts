import { Inject, Injectable } from '@nestjs/common';
import type { Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { requireActivePlayer } from './require-active-player.js';

@Injectable()
export class DeletePlayer {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(id: number): Promise<void> {
    const player = await requireActivePlayer(this.players, id);
    player.exclude();
    await this.players.save(player);
  }
}
