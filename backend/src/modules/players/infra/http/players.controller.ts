import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  CHANGE_PLAYER_CONDITION,
  type ChangePlayerConditionPort,
} from '../../application/use-cases/change-player-condition.use-case.js';
import {
  CREATE_PLAYER,
  type CreatePlayerPort,
} from '../../application/use-cases/create-player.use-case.js';
import {
  DELETE_PLAYER,
  type DeletePlayerPort,
} from '../../application/use-cases/delete-player.use-case.js';
import {
  FIND_PLAYER,
  type FindPlayerPort,
} from '../../application/use-cases/find-player.use-case.js';
import {
  LIST_PLAYERS,
  type ListPlayersPort,
} from '../../application/use-cases/list-players.use-case.js';
import type { PlayerListQuery } from '../../application/queries/player-list-query.js';
import {
  UPDATE_PLAYER,
  type UpdatePlayerPort,
} from '../../application/use-cases/update-player.use-case.js';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { createPlayerSchema } from './dto/create-player.schema.js';
import type { CreatePlayerBody } from './dto/create-player.schema.js';
import { updateConditionSchema } from './dto/update-condition.schema.js';
import type { UpdateConditionBody } from './dto/update-condition.schema.js';
import { updatePlayerSchema } from './dto/update-player.schema.js';
import type { UpdatePlayerBody } from './dto/update-player.schema.js';
import { playerIdSchema } from './input/player-id.schema.js';
import { playerListQuerySchema } from './input/player-list-query.schema.js';
import {
  presentPlayer,
  presentPlayerList,
} from './presenters/player-response.js';

@Controller('players')
export class PlayersController {
  constructor(
    @Inject(CREATE_PLAYER) private readonly createPlayer: CreatePlayerPort,
    @Inject(FIND_PLAYER) private readonly findPlayer: FindPlayerPort,
    @Inject(LIST_PLAYERS) private readonly listPlayers: ListPlayersPort,
    @Inject(UPDATE_PLAYER) private readonly updatePlayer: UpdatePlayerPort,
    @Inject(CHANGE_PLAYER_CONDITION)
    private readonly changePlayerCondition: ChangePlayerConditionPort,
    @Inject(DELETE_PLAYER) private readonly deletePlayer: DeletePlayerPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodPipe(createPlayerSchema)) body: CreatePlayerBody,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const player = presentPlayer(await this.createPlayer.execute(body));
    reply.header('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  async findAll(
    @Query(new ZodPipe(playerListQuerySchema)) query: PlayerListQuery,
  ) {
    return presentPlayerList(await this.listPlayers.execute(query));
  }

  @Get(':id')
  async findOne(
    @Param('id', new ZodPipe(playerIdSchema, 'not_found')) id: number,
  ) {
    return presentPlayer(await this.findPlayer.execute(id));
  }

  @Put(':id')
  async update(
    @Param('id', new ZodPipe(playerIdSchema, 'not_found')) id: number,
    @Body(new ZodPipe(updatePlayerSchema)) body: UpdatePlayerBody,
  ) {
    return presentPlayer(await this.updatePlayer.execute(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ZodPipe(playerIdSchema, 'not_found')) id: number,
  ): Promise<void> {
    await this.deletePlayer.execute(id);
  }

  @Patch(':id/condition')
  async updateCondition(
    @Param('id', new ZodPipe(playerIdSchema, 'not_found')) id: number,
    @Body(new ZodPipe(updateConditionSchema)) body: UpdateConditionBody,
  ) {
    return presentPlayer(
      await this.changePlayerCondition.execute(id, body.condition),
    );
  }
}
