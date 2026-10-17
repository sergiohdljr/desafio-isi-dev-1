import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { CLOCK, type Clock } from '../../../../common/clock/clock.js';
import {
  CLUBS_REPOSITORY,
  type ClubsRepository,
} from '../../../clubs/application/repositories/clubs-repository.js';
import { decideMatch } from '../../domain/play-match.js';
import { rankStandings, type StandingRow } from '../../domain/standings.js';
import {
  LEAGUE_REPOSITORY,
  type LeagueRepository,
  type MatchSummary,
  type SavedMatch,
} from '../repositories/league-repository.js';

export const PLAY_MATCH = Symbol('PLAY_MATCH');
export const LIST_MATCHES = Symbol('LIST_MATCHES');
export const FIND_MATCH = Symbol('FIND_MATCH');
export const LIST_STANDINGS = Symbol('LIST_STANDINGS');

export interface PlayMatchPort {
  execute(input: {
    homeClubId: number;
    awayClubId: number;
  }): Promise<SavedMatch>;
}

export interface ListMatchesPort {
  execute(clubId?: number): Promise<MatchSummary[]>;
}

export interface FindMatchPort {
  execute(id: number): Promise<SavedMatch>;
}

export interface ListStandingsPort {
  execute(): Promise<StandingRow[]>;
}

@Injectable()
export class PlayMatch implements PlayMatchPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  execute(input: {
    homeClubId: number;
    awayClubId: number;
  }): Promise<SavedMatch> {
    return this.league.play(
      input.homeClubId,
      input.awayClubId,
      this.clock.now(),
      decideMatch,
    );
  }
}

@Injectable()
export class ListMatches implements ListMatchesPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
  ) {}

  async execute(clubId?: number): Promise<MatchSummary[]> {
    if (clubId !== undefined) {
      const club = await this.clubs.findById(clubId);
      if (!club) {
        throw new DomainError('missing', 'Clube não encontrado');
      }
    }
    return this.league.listMatches(clubId);
  }
}

@Injectable()
export class FindMatch implements FindMatchPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
  ) {}

  async execute(id: number): Promise<SavedMatch> {
    const match = await this.league.findMatch(id);
    if (!match) {
      throw new DomainError('missing', 'Partida não encontrada');
    }
    return match;
  }
}

@Injectable()
export class ListStandings implements ListStandingsPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
    @Inject(CLUBS_REPOSITORY) private readonly clubs: ClubsRepository,
  ) {}

  async execute(): Promise<StandingRow[]> {
    const clubs = await this.clubs.list();
    const matches = await this.league.standingsSource();
    return rankStandings(
      clubs.map((club) => ({ id: club.id, name: club.name })),
      matches,
    );
  }
}
