import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ClubsModule } from './modules/clubs/clubs.module.js';
import { LeagueModule } from './modules/league/league.module.js';
import { MarketModule } from './modules/market/market.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { HealthController } from './common/http/health.controller.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { validateEnv } from './config/env.validation.js';
import { PlayersModule } from './modules/players/players.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
    LeagueModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
