import { Inject, Injectable } from '@nestjs/common';
import {
  playerViewOf,
  type PlayerView,
} from '../../../players/application/read-models/player-view.js';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import {
  penaltyRateFor,
  saleRemainingDays,
} from '../../../market/domain/sale-settlement.js';
import { arrangeSquad, squadValueOf } from '../../domain/entities/squad.js';
import { CLOCK, type Clock } from '../../../../common/clock/clock.js';
import { clubViewOf, type ClubView } from '../read-models/club-view.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../repositories/clubs-repository.js';
import {
  SQUAD_READER,
  type SquadMember,
  type SquadReader,
} from '../repositories/squad-reader.js';

export const FIND_CLUB = Symbol('FIND_CLUB');

type SquadPlayerView = PlayerView & {
  contract: {
    purchaseValue: number;
    loyaltyUntil: Date;
    remainingDays: number;
    penaltyRate: 0 | 5 | 10 | 20;
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
    @Inject(SQUAD_READER) private readonly squad: SquadReader,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(id: number): Promise<ClubDetailView> {
    const club = await this.clubs.findById(id);
    if (!club) {
      throw new DomainError('missing', 'Clube não encontrado');
    }

    const now = this.clock.now();
    const members = await this.squad.listByClub(club.id);
    const players = arrangeSquad(
      members.map((member) => ({
        ...playerViewOf(member.player),
        contract: contractOf(member, now),
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

function contractOf(member: SquadMember, now: Date) {
  const days = saleRemainingDays(member.loyaltyUntil, now);
  return {
    purchaseValue: member.purchaseValue.amount,
    loyaltyUntil: member.loyaltyUntil,
    remainingDays: days,
    penaltyRate: penaltyRateFor(days),
  };
}
