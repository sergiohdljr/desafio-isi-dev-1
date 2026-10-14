import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { clubIdSchema } from '../../../clubs/infra/http/input/club-id.schema.js';
import {
  FIND_MATCH,
  LIST_MATCHES,
  LIST_STANDINGS,
  PLAY_MATCH,
  type FindMatchPort,
  type ListMatchesPort,
  type ListStandingsPort,
  type PlayMatchPort,
} from '../../application/use-cases/match.use-case.js';
import {
  playMatchSchema,
  type PlayMatchBody,
} from './dto/play-match.schema.js';
import {
  matchListQuerySchema,
  type MatchListQuery,
} from './input/match-list-query.schema.js';
import {
  presentMatch,
  presentMatchSummary,
  presentStanding,
} from './presenters/league-response.js';

@Controller('matches')
export class MatchesController {
  constructor(
    @Inject(PLAY_MATCH) private readonly playMatch: PlayMatchPort,
    @Inject(LIST_MATCHES) private readonly listMatches: ListMatchesPort,
    @Inject(FIND_MATCH) private readonly findMatch: FindMatchPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async play(
    @Body(new ZodPipe(playMatchSchema)) body: PlayMatchBody,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const match = presentMatch(await this.playMatch.execute(body));
    reply.header('Location', `/api/v1/matches/${match.id}`);
    return match;
  }

  @Get()
  async list(@Query(new ZodPipe(matchListQuerySchema)) query: MatchListQuery) {
    const matches = await this.listMatches.execute(query.clubId);
    return matches.map(presentMatchSummary);
  }

  @Get(':id')
  async show(
    @Param(
      'id',
      new ZodPipe(clubIdSchema, 'not_found', 'Partida não encontrada'),
    )
    id: number,
  ) {
    return presentMatch(await this.findMatch.execute(id));
  }
}

@Controller('standings')
export class StandingsController {
  constructor(
    @Inject(LIST_STANDINGS) private readonly listStandings: ListStandingsPort,
  ) {}

  @Get()
  async list() {
    return (await this.listStandings.execute()).map(presentStanding);
  }
}
