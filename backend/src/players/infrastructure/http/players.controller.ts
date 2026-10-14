import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ChangePlayerCondition } from '../../application/change-player-condition.js';
import { CreatePlayer } from '../../application/create-player.js';
import { DeletePlayer } from '../../application/delete-player.js';
import { FindPlayer } from '../../application/find-player.js';
import { ListPlayers } from '../../application/list-players.usecase.js';
import type { PlayerListQuery } from '../../application/player-list-query.js';
import { UpdatePlayer } from '../../application/update-player.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdateConditionDto } from './dto/update-condition.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { ListPlayersQueryPipe } from './list-players-query.pipe.js';
import { parsePlayerId } from './parse-player-id.js';
import { toPlayerResponse } from './player-response.js';

@Controller('players')
export class PlayersController {
  constructor(
    private readonly createPlayer: CreatePlayer,
    private readonly findPlayer: FindPlayer,
    private readonly listPlayers: ListPlayers,
    private readonly updatePlayer: UpdatePlayer,
    private readonly changePlayerCondition: ChangePlayerCondition,
    private readonly deletePlayer: DeletePlayer,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreatePlayerDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    assertJsonObject(body);
    const player = toPlayerResponse(await this.createPlayer.execute(body));
    reply.header('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  async findAll(@Query(new ListPlayersQueryPipe()) query: PlayerListQuery) {
    const page = await this.listPlayers.execute(query);
    return {
      data: page.data.map(toPlayerResponse),
      meta: page.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return toPlayerResponse(await this.findPlayer.execute(parsePlayerId(id)));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePlayerDto) {
    assertJsonObject(body);
    return toPlayerResponse(
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
    return toPlayerResponse(
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
