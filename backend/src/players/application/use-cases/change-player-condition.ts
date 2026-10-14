import { Inject, Injectable } from '@nestjs/common';
import { type Condition } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { playerViewOf, type PlayerView } from './player-view.js';
import { requireActivePlayer } from './require-active-player.js';

export const CHANGE_PLAYER_CONDITION = Symbol('CHANGE_PLAYER_CONDITION');

export interface ChangePlayerConditionPort {
  execute(id: number, condition: Condition): Promise<PlayerView>;
}

@Injectable()
export class ChangePlayerCondition implements ChangePlayerConditionPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(id: number, condition: Condition): Promise<PlayerView> {
    const player = await requireActivePlayer(this.players, id);
    if (player.changeCondition(condition)) {
      await this.players.save(player);
    }
    return playerViewOf(player);
  }
}
