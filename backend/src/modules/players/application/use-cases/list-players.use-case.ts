import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../../../clubs/application/repositories/clubs-repository.js';
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
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
  ) {}

  async execute(query: PlayerListQuery): Promise<PlayerListView> {
    if (query.clubId !== undefined) {
      const club = await this.clubs.findById(query.clubId);
      if (!club) {
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
