import { Module } from '@nestjs/common';
import { ChangePlayerCondition } from './application/change-player-condition.js';
import { CreatePlayer } from './application/create-player.js';
import { DeletePlayer } from './application/delete-player.js';
import { FindPlayer } from './application/find-player.js';
import { ListPlayers } from './application/list-players.usecase.js';
import { PLAYERS } from './application/players.token.js';
import { UpdatePlayer } from './application/update-player.js';
import { PlayersController } from './infrastructure/http/players.controller.js';
import { PrismaPlayersRepository } from './infrastructure/prisma/players.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [
    CreatePlayer,
    FindPlayer,
    ListPlayers,
    UpdatePlayer,
    ChangePlayerCondition,
    DeletePlayer,
    { provide: PLAYERS, useClass: PrismaPlayersRepository },
  ],
})
export class PlayersModule {}
