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
import { ZodPipe } from '../../../common/validation/zod-pipe.js';
import {
  CREATE_CLUB,
  type CreateClubPort,
} from '../../application/use-cases/create-club.use-case.js';
import {
  FIND_CLUB,
  type FindClubPort,
} from '../../application/use-cases/find-club.use-case.js';
import {
  LIST_CLUBS,
  type ListClubsPort,
} from '../../application/use-cases/list-clubs.use-case.js';
import { createClubSchema } from './dto/create-club.schema.js';
import type { CreateClubBody } from './dto/create-club.schema.js';
import { clubIdSchema } from './input/club-id.schema.js';
import { type ClubListQuery } from '../../application/queries/club-list-query.js';
import { clubListQuerySchema } from './input/club-list-query.schema.js';
import { presentClub, presentClubDetail } from './presenters/club-response.js';

@Controller('clubs')
export class ClubsController {
  constructor(
    @Inject(CREATE_CLUB) private readonly createClub: CreateClubPort,
    @Inject(FIND_CLUB) private readonly findClub: FindClubPort,
    @Inject(LIST_CLUBS) private readonly listClubs: ListClubsPort,
  ) {}

  @Get()
  async findAll(
    @Query(new ZodPipe(clubListQuerySchema))
    query: ClubListQuery,
  ) {
    return (await this.listClubs.execute(query)).map(presentClub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodPipe(createClubSchema)) body: CreateClubBody,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const club = presentClub(await this.createClub.execute(body));
    reply.header('Location', `/api/v1/clubs/${club.id}`);
    return club;
  }

  @Get(':id')
  async findOne(
    @Param('id', new ZodPipe(clubIdSchema, 'not_found', 'Clube não encontrado'))
    id: number,
  ) {
    return presentClubDetail(await this.findClub.execute(id));
  }
}
