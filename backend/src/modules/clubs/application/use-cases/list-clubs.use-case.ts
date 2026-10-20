import { Inject, Injectable } from '@nestjs/common';
import { Money } from '../../../../shared/domain/money.js';
import { arrangeClubs } from '../queries/arrange-clubs.js';
import { type ClubListQuery } from '../queries/club-list-query.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';
import {
  SQUAD_READER,
  type SquadReader,
} from '../repositories/squad-reader.js';

export const LIST_CLUBS = Symbol('LIST_CLUBS');

export interface ListClubsPort {
  execute(query: ClubListQuery): Promise<ClubView[]>;
}

@Injectable()
export class ListClubs implements ListClubsPort {
  constructor(
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
    @Inject(SQUAD_READER) private readonly squad: SquadReader,
  ) {}

  async execute(query: ClubListQuery): Promise<ClubView[]> {
    const [clubs, squadValues] = await Promise.all([
      this.clubs.list(),
      this.squad.squadValues(),
    ]);

    const listed = clubs.map((club) => ({
      club,
      squadValue: squadValues.get(club.id) ?? Money.fromCents(0),
    }));
    return arrangeClubs(listed, query.sort).map((item) =>
      clubViewOf(item.club, item.squadValue),
    );
  }
}
