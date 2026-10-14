import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { ClubsModule } from '../clubs/clubs.module.js';
import { MARKET_REPOSITORY } from './application/repositories/market-repository.js';
import {
  BUY_PLAYER,
  BuyPlayer,
} from './application/use-cases/buy-player.use-case.js';
import {
  LIST_TRANSACTIONS,
  ListTransactions,
} from './application/use-cases/list-transactions.use-case.js';
import {
  SELL_PLAYER,
  SellPlayer,
} from './application/use-cases/sell-player.use-case.js';
import { ClubsMarketController } from './infra/http/clubs-market.controller.js';
import { PlayersMarketController } from './infra/http/players-market.controller.js';
import { PrismaMarketRepository } from './infra/repositories/prisma-market-repository.js';

@Module({
  imports: [PrismaModule, ClubsModule],
  controllers: [PlayersMarketController, ClubsMarketController],
  providers: [
    { provide: BUY_PLAYER, useClass: BuyPlayer },
    { provide: SELL_PLAYER, useClass: SellPlayer },
    { provide: LIST_TRANSACTIONS, useClass: ListTransactions },
    { provide: MARKET_REPOSITORY, useClass: PrismaMarketRepository },
  ],
})
export class MarketModule {}
