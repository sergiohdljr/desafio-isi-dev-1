import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ClubsModule } from './clubs/clubs.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { validateEnv } from './config/env.validation.js';
import { PlayersModule } from './players/players.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    PlayersModule,
    ClubsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
