import { Inject, Injectable } from '@nestjs/common';
import {
  playerViewOf,
  type PlayerView,
} from '../../../players/application/read-models/player-view.js';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { arrangeSquad } from '../../../clubs/domain/entities/squad.js';
import {
  assertEligibleLineup,
  type Formation,
} from '../../domain/formation.js';
import {
  LEAGUE_REPOSITORY,
  type LeagueRepository,
} from '../repositories/league-repository.js';

export const FIND_LINEUP = Symbol('FIND_LINEUP');
export const SET_LINEUP = Symbol('SET_LINEUP');

export type LineupView = {
  clubId: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerView[];
};

export interface FindLineupPort {
  execute(clubId: number): Promise<LineupView>;
}

export interface SetLineupPort {
  execute(
    clubId: number,
    input: { formation: Formation; playerIds: number[] },
  ): Promise<LineupView>;
}

@Injectable()
export class FindLineup implements FindLineupPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
  ) {}

  async execute(clubId: number): Promise<LineupView> {
    return lineupView(this.league, clubId);
  }
}

@Injectable()
export class SetLineup implements SetLineupPort {
  constructor(
    @Inject(LEAGUE_REPOSITORY) private readonly league: LeagueRepository,
  ) {}

  async execute(
    clubId: number,
    input: { formation: Formation; playerIds: number[] },
  ): Promise<LineupView> {
    await this.league.replaceLineup(
      clubId,
      input.formation,
      input.playerIds,
      (facts) => {
        if (!facts.clubFound) {
          throw new DomainError('missing', 'Clube não encontrado');
        }
        if (facts.players.length !== input.playerIds.length) {
          throw new DomainError('missing', 'Jogador não encontrado');
        }
        assertEligibleLineup(input.formation, facts.players, clubId);
      },
    );
    return lineupView(this.league, clubId);
  }
}

async function lineupView(
  league: LeagueRepository,
  clubId: number,
): Promise<LineupView> {
  const lineup = await league.findLineup(clubId);
  if (!lineup) {
    throw new DomainError('missing', 'Clube não encontrado');
  }

  const players = arrangeSquad(lineup.players.map(playerViewOf));
  return {
    clubId,
    formation: lineup.formation,
    complete: lineup.formation !== null && players.length === 5,
    players,
  };
}
