import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PlayersController } from './players.controller.js';
import { PlayersRepository } from './players.repository.js';
import { PlayersService } from './players.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [PlayersService, PlayersRepository],
})
export class PlayersModule {}
