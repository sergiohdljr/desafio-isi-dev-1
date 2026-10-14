import { Inject, Injectable } from '@nestjs/common';
import {
  playerViewOf,
  type PlayerView,
} from '../../../players/application/read-models/player-view.js';
import { DomainError } from '../../../shared/domain/domain-error.js';
import { arrangeSquad, remainingDays, squadValueOf } from '../../domain/entities/squad.js';
import { CLOCK, type Clock } from '../clock.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';

export const FIND_CLUB = Symbol('FIND_CLUB');

export type SquadPlayerView = PlayerView & {
  contract: {
    purchaseValue: number;
    loyaltyUntil: Date;
    remainingDays: number;
  };
};

export type ClubDetailView = ClubView & {
  players: SquadPlayerView[];
};

export interface FindClubPort {
  execute(id: number): Promise<ClubDetailView>;
}

@Injectable()
export class FindClub implements FindClubPort {
  constructor(
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(id: number): Promise<ClubDetailView> {
    const club = await this.clubs.findById(id);
    if (!club) {
      throw new DomainError('missing', 'Clube não encontrado');
    }

    const now = this.clock.now();
    const members = (await this.clubs.squad()).filter(
      (member) => member.clubId === club.id,
    );
    const players = arrangeSquad(
      members.map((member) => ({
        ...playerViewOf(member.player),
        contract: {
          purchaseValue: member.purchaseValue.amount,
          loyaltyUntil: member.loyaltyUntil,
          remainingDays: remainingDays(member.loyaltyUntil, now),
        },
      })),
    );

    return {
      ...clubViewOf(
        club,
        squadValueOf(members.map((member) => member.player.marketValue)),
      ),
      players,
    };
  }
}
