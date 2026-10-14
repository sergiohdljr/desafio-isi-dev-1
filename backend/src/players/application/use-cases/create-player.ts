import { Inject, Injectable } from '@nestjs/common';
import { Player, type RegisterPlayer } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { playerViewOf, type PlayerView } from './player-view.js';

export const CREATE_PLAYER = Symbol('CREATE_PLAYER');

export interface CreatePlayerPort {
  execute(input: RegisterPlayer): Promise<PlayerView>;
}

@Injectable()
export class CreatePlayer implements CreatePlayerPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(input: RegisterPlayer): Promise<PlayerView> {
    return playerViewOf(await this.players.add(Player.register(input)));
  }
}
