import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../shared/domain/domain-error.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';

export const FIND_CLUB = Symbol('FIND_CLUB');

export type ClubDetailView = ClubView & {
  players: [];
};

export interface FindClubPort {
  execute(id: number): Promise<ClubDetailView>;
}

@Injectable()
export class FindClub implements FindClubPort {
  constructor(
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
  ) {}

  async execute(id: number): Promise<ClubDetailView> {
    const club = await this.clubs.findById(id);
    if (!club) {
      throw new DomainError('missing', 'Clube não encontrado');
    }

    return { ...clubViewOf(club), players: [] };
  }
}
