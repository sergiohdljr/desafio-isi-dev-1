import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../shared/domain/domain-error.js';
import { type PlayersRepository } from '../repositories/players-repository.js';
import { PLAYERS_REPOSITORY } from '../repositories/players-repository.js';
import { arrangePlayers } from '../queries/player-list.js';
import { type PlayerListQuery } from '../queries/player-list-query.js';
import {
  playerViewOf,
  type PlayerListView,
} from '../read-models/player-view.js';

export const LIST_PLAYERS = Symbol('LIST_PLAYERS');

export interface ListPlayersPort {
  execute(query: PlayerListQuery): Promise<PlayerListView>;
}

@Injectable()
export class ListPlayers implements ListPlayersPort {
  constructor(
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(query: PlayerListQuery): Promise<PlayerListView> {
    if (query.clubId !== undefined) {
      const clubExists = await this.players.clubExists(query.clubId);
      if (!clubExists) {
        throw new DomainError('missing', 'Clube não encontrado');
      }
    }

    const page = arrangePlayers(await this.players.findActive(), query);
    return {
      data: page.data.map(playerViewOf),
      meta: page.meta,
    };
  }
}
