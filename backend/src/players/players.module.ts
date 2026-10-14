import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PLAYERS } from './use-cases/players.token.js';
import { PrismaPlayersRepository } from './infrastructure/prisma/players.repository.js';
import { PlayersController } from './infrastructure/http/players.controller.js';
import {
  CHANGE_PLAYER_CONDITION,
  ChangePlayerCondition,
} from './use-cases/change-player-condition.js';
import { CREATE_PLAYER, CreatePlayer } from './use-cases/create-player.js';
import { DELETE_PLAYER, DeletePlayer } from './use-cases/delete-player.js';
import { FIND_PLAYER, FindPlayer } from './use-cases/find-player.js';
import { LIST_PLAYERS, ListPlayers } from './use-cases/list-players.usecase.js';
import { UPDATE_PLAYER, UpdatePlayer } from './use-cases/update-player.js';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [
    { provide: CREATE_PLAYER, useClass: CreatePlayer },
    { provide: FIND_PLAYER, useClass: FindPlayer },
    { provide: LIST_PLAYERS, useClass: ListPlayers },
    { provide: UPDATE_PLAYER, useClass: UpdatePlayer },
    { provide: CHANGE_PLAYER_CONDITION, useClass: ChangePlayerCondition },
    { provide: DELETE_PLAYER, useClass: DeletePlayer },
    { provide: PLAYERS, useClass: PrismaPlayersRepository },
  ],
})
export class PlayersModule {}
