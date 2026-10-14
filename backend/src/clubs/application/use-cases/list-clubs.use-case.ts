import { Inject, Injectable } from '@nestjs/common';
import { Money } from '../../../shared/domain/money.js';
import {
  PLAYERS_REPOSITORY,
  type PlayersRepository,
} from '../../../players/application/repositories/players-repository.js';
import { arrangeClubs } from '../queries/arrange-clubs.js';
import { type ClubListQuery } from '../queries/club-list-query.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';

export const LIST_CLUBS = Symbol('LIST_CLUBS');

export interface ListClubsPort {
  execute(query: ClubListQuery): Promise<ClubView[]>;
}

@Injectable()
export class ListClubs implements ListClubsPort {
  constructor(
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
    @Inject(PLAYERS_REPOSITORY) private readonly players: PlayersRepository,
  ) {}

  async execute(query: ClubListQuery): Promise<ClubView[]> {
    const clubs = await this.clubs.list();
    const centsByClub = new Map<number, number>();
    for (const player of await this.players.findActive()) {
      if (player.clubId === null) {
        continue;
      }
      centsByClub.set(
        player.clubId,
        (centsByClub.get(player.clubId) ?? 0) + player.marketValue.cents,
      );
    }

    const listed = clubs.map((club) => ({
      club,
      squadValue: Money.fromCents(centsByClub.get(club.id) ?? 0),
    }));
    return arrangeClubs(listed, query.sort).map((item) =>
      clubViewOf(item.club, item.squadValue),
    );
  }
}
