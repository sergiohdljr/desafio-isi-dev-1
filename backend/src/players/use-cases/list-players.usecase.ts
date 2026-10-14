import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/domain/domain-error.js';
import { type Players } from '../domain/players.js';
import { PLAYERS } from './players.token.js';
import { listPlayers } from './list-players.js';
import { type PlayerListQuery } from './player-list-query.js';
import { playerViewOf, type PlayerListView } from './player-view.js';

export const LIST_PLAYERS = Symbol('LIST_PLAYERS');

export interface ListPlayersPort {
  execute(query: PlayerListQuery): Promise<PlayerListView>;
}

@Injectable()
export class ListPlayers implements ListPlayersPort {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(query: PlayerListQuery): Promise<PlayerListView> {
    if (query.clubId !== undefined) {
      const clubExists = await this.players.clubExists(query.clubId);
      if (!clubExists) {
        throw new DomainError('missing', 'Clube não encontrado');
      }
    }

    const page = listPlayers(await this.players.findActive(), query);
    return {
      data: page.data.map(playerViewOf),
      meta: page.meta,
    };
  }
}
