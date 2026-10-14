import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CLOCK, SystemClock } from '../clubs/application/clock.js';
import { MARKET_REPOSITORY } from './application/repositories/market-repository.js';
import {
  BUY_PLAYER,
  BuyPlayer,
} from './application/use-cases/buy-player.use-case.js';
import { PlayersMarketController } from './infra/http/players-market.controller.js';
import { PrismaMarketRepository } from './infra/repositories/prisma-market-repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersMarketController],
  providers: [
    { provide: BUY_PLAYER, useClass: BuyPlayer },
    { provide: MARKET_REPOSITORY, useClass: PrismaMarketRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
})
export class MarketModule {}
