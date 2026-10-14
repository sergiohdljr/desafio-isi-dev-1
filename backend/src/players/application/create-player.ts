import { Inject, Injectable } from '@nestjs/common';
import { Player, RegisterPlayer } from '../domain/player.js';
import type { Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';

@Injectable()
export class CreatePlayer {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  execute(input: RegisterPlayer): Promise<Player> {
    return this.players.add(Player.register(input));
  }
}
