import { Inject, Injectable } from '@nestjs/common';
import { Player, type RegisterPlayer } from '../domain/player.js';
import { type Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { playerViewOf, type PlayerView } from './player-view.js';

export const CREATE_PLAYER = Symbol('CREATE_PLAYER');

export interface CreatePlayerPort {
  execute(input: RegisterPlayer): Promise<PlayerView>;
}

@Injectable()
export class CreatePlayer implements CreatePlayerPort {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(input: RegisterPlayer): Promise<PlayerView> {
    return playerViewOf(await this.players.add(Player.register(input)));
  }
}
