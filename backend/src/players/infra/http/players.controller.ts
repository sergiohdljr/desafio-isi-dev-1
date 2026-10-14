import {
  BadRequestException,
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
} from '../../application/use-cases/change-player-condition.js';
import {
  CREATE_PLAYER,
  type CreatePlayerPort,
} from '../../application/use-cases/create-player.js';
import {
  DELETE_PLAYER,
  type DeletePlayerPort,
} from '../../application/use-cases/delete-player.js';
import {
  FIND_PLAYER,
  type FindPlayerPort,
} from '../../application/use-cases/find-player.js';
import {
  LIST_PLAYERS,
  type ListPlayersPort,
} from '../../application/use-cases/list-players.js';
import type { PlayerListQuery } from '../../application/use-cases/player-list-query.js';
import {
  UPDATE_PLAYER,
  type UpdatePlayerPort,
} from '../../application/use-cases/update-player.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdateConditionDto } from './dto/update-condition.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { ListPlayersQueryPipe } from './list-players-query.pipe.js';
import { parsePlayerId } from './parse-player-id.js';
import { presentPlayer, presentPlayerList } from './player-response.js';

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
    @Body() body: CreatePlayerDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    assertJsonObject(body);
    const player = presentPlayer(await this.createPlayer.execute(body));
    reply.header('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  async findAll(@Query(new ListPlayersQueryPipe()) query: PlayerListQuery) {
    return presentPlayerList(await this.listPlayers.execute(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return presentPlayer(await this.findPlayer.execute(parsePlayerId(id)));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePlayerDto) {
    assertJsonObject(body);
    return presentPlayer(
      await this.updatePlayer.execute(parsePlayerId(id), body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deletePlayer.execute(parsePlayerId(id));
  }

  @Patch(':id/condition')
  async updateCondition(
    @Param('id') id: string,
    @Body() body: UpdateConditionDto,
  ) {
    assertJsonObject(body);
    return presentPlayer(
      await this.changePlayerCondition.execute(
        parsePlayerId(id),
        body.condition,
      ),
    );
  }
}

function assertJsonObject(body: unknown): void {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('O corpo deve ser um objeto JSON');
  }
}
