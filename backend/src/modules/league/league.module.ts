import { Module } from '@nestjs/common';
import { ClockModule } from '../../common/clock/clock.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { ClubsModule } from '../clubs/clubs.module.js';
import { LEAGUE_REPOSITORY } from './application/repositories/league-repository.js';
import {
  FIND_LINEUP,
  FindLineup,
  SET_LINEUP,
  SetLineup,
} from './application/use-cases/lineup.use-case.js';
import {
  FIND_MATCH,
  FindMatch,
  LIST_MATCHES,
  LIST_STANDINGS,
  ListMatches,
  ListStandings,
  PLAY_MATCH,
  PlayMatch,
} from './application/use-cases/match.use-case.js';
import { LineupController } from './infra/http/lineup.controller.js';
import {
  MatchesController,
  StandingsController,
} from './infra/http/matches.controller.js';
import { PrismaLeagueRepository } from './infra/repositories/prisma-league-repository.js';

@Module({
  imports: [PrismaModule, ClockModule, ClubsModule],
  controllers: [LineupController, MatchesController, StandingsController],
  providers: [
    { provide: FIND_LINEUP, useClass: FindLineup },
    { provide: SET_LINEUP, useClass: SetLineup },
    { provide: PLAY_MATCH, useClass: PlayMatch },
    { provide: LIST_MATCHES, useClass: ListMatches },
    { provide: FIND_MATCH, useClass: FindMatch },
    { provide: LIST_STANDINGS, useClass: ListStandings },
    { provide: LEAGUE_REPOSITORY, useClass: PrismaLeagueRepository },
  ],
})
export class LeagueModule {}
