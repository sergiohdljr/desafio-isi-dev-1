import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/domain/domain-error.js';
import type { Players } from '../domain/players.js';
import { listPlayers, PlayerListPage } from './list-players.js';
import { PlayerListQuery } from './player-list-query.js';
import { PLAYERS } from './players.token.js';

@Injectable()
export class ListPlayers {
  constructor(@Inject(PLAYERS) private readonly players: Players) {}

  async execute(query: PlayerListQuery): Promise<PlayerListPage> {
    if (query.clubId !== undefined) {
      const club = await this.players.clubExists(query.clubId);
      if (!club) {
        throw new DomainError('missing', 'Clube não encontrado');
      }
    }

    return listPlayers(await this.players.findActive(), query);
  }
}
