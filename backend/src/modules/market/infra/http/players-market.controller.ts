import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { playerIdSchema } from '../../../players/infra/http/input/player-id.schema.js';
import {
  BUY_PLAYER,
  type BuyPlayerPort,
} from '../../application/use-cases/buy-player.use-case.js';
import {
  SELL_PLAYER,
  type SellPlayerPort,
} from '../../application/use-cases/sell-player.use-case.js';
import { buyPlayerSchema, type BuyPlayerBody } from './dto/buy-player.schema.js';
import { presentPurchase } from './presenters/purchase-response.js';
import { presentSale } from './presenters/sale-response.js';

@Controller('players')
export class PlayersMarketController {
  constructor(
    @Inject(BUY_PLAYER) private readonly buyPlayer: BuyPlayerPort,
    @Inject(SELL_PLAYER) private readonly sellPlayer: SellPlayerPort,
  ) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  async buy(
    @Param(
      'id',
      new ZodPipe(playerIdSchema, 'not_found', 'Jogador não encontrado'),
    )
    id: number,
    @Body(new ZodPipe(buyPlayerSchema)) body: BuyPlayerBody,
  ) {
    return presentPurchase(
      await this.buyPlayer.execute({
        playerId: id,
        clubId: body.clubId,
        loyaltyUntil: body.loyaltyUntil,
      }),
    );
  }

  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  async sell(
    @Param(
      'id',
      new ZodPipe(playerIdSchema, 'not_found', 'Jogador não encontrado'),
    )
    id: number,
  ) {
    return presentSale(await this.sellPlayer.execute(id));
  }
}
