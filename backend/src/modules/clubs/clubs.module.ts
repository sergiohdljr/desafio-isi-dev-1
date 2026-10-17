import { Module } from '@nestjs/common';
import { ClockModule } from '../../common/clock/clock.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CLUBS_REPOSITORY } from './application/repositories/clubs-repository.js';
import { SQUAD_READER } from './application/repositories/squad-reader.js';
import {
  CREATE_CLUB,
  CreateClub,
} from './application/use-cases/create-club.use-case.js';
import {
  FIND_CLUB,
  FindClub,
} from './application/use-cases/find-club.use-case.js';
import {
  LIST_CLUBS,
  ListClubs,
} from './application/use-cases/list-clubs.use-case.js';
import { ClubsController } from './infra/http/clubs.controller.js';
import { PrismaClubsRepository } from './infra/repositories/prisma-clubs-repository.js';
import { PrismaSquadReader } from './infra/repositories/prisma-squad-reader.js';

@Module({
  imports: [PrismaModule, ClockModule],
  controllers: [ClubsController],
  providers: [
    { provide: CREATE_CLUB, useClass: CreateClub },
    { provide: FIND_CLUB, useClass: FindClub },
    { provide: LIST_CLUBS, useClass: ListClubs },
    { provide: CLUBS_REPOSITORY, useClass: PrismaClubsRepository },
    { provide: SQUAD_READER, useClass: PrismaSquadReader },
  ],
  exports: [CREATE_CLUB, CLUBS_REPOSITORY],
})
export class ClubsModule {}
