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
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdateConditionDto } from './dto/update-condition.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { ListPlayersQueryPipe } from './list-players-query.pipe.js';
import { parsePlayerId } from './parse-player-id.js';
import type { PlayerListQuery } from './player-list-query.js';
import { PlayersService } from './players.service.js';

@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreatePlayerDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    assertJsonObject(body);
    const player = await this.players.create(body);
    reply.header('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  findAll(@Query(new ListPlayersQueryPipe()) query: PlayerListQuery) {
    return this.players.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.players.findOne(parsePlayerId(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdatePlayerDto) {
    assertJsonObject(body);
    return this.players.update(parsePlayerId(id), body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.players.remove(parsePlayerId(id));
  }

  @Patch(':id/condition')
  updateCondition(@Param('id') id: string, @Body() body: UpdateConditionDto) {
    assertJsonObject(body);
    return this.players.updateCondition(parsePlayerId(id), body.condition);
  }
}

function assertJsonObject(body: unknown): void {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('O corpo deve ser um objeto JSON');
  }
}
