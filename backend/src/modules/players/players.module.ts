import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PLAYERS_REPOSITORY } from './application/repositories/players-repository.js';
import { PlayersController } from './infra/http/players.controller.js';
import { PrismaPlayersRepository } from './infra/repositories/prisma-players-repository.js';
import {
  CHANGE_PLAYER_CONDITION,
  ChangePlayerCondition,
} from './application/use-cases/change-player-condition.use-case.js';
import {
  CREATE_PLAYER,
  CreatePlayer,
} from './application/use-cases/create-player.use-case.js';
import {
  DELETE_PLAYER,
  DeletePlayer,
} from './application/use-cases/delete-player.use-case.js';
import {
  FIND_PLAYER,
  FindPlayer,
} from './application/use-cases/find-player.use-case.js';
import {
  LIST_PLAYERS,
  ListPlayers,
} from './application/use-cases/list-players.use-case.js';
import {
  UPDATE_PLAYER,
  UpdatePlayer,
} from './application/use-cases/update-player.use-case.js';

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
    { provide: PLAYERS_REPOSITORY, useClass: PrismaPlayersRepository },
  ],
})
export class PlayersModule {}
