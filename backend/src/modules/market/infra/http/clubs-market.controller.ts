import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ZodPipe } from '../../../../common/validation/zod-pipe.js';
import { clubIdSchema } from '../../../clubs/infra/http/input/club-id.schema.js';
import { type TransactionFilter } from '../../application/repositories/market-repository.js';
import {
  LIST_TRANSACTIONS,
  type ListTransactionsPort,
} from '../../application/use-cases/list-transactions.use-case.js';
import { transactionQuerySchema } from './input/transaction-query.schema.js';
import { presentTransactions } from './presenters/transaction-response.js';

@Controller('clubs')
export class ClubsMarketController {
  constructor(
    @Inject(LIST_TRANSACTIONS)
    private readonly listTransactions: ListTransactionsPort,
  ) {}

  @Get(':id/transactions')
  async list(
    @Param(
      'id',
      new ZodPipe(clubIdSchema, 'not_found', 'Clube não encontrado'),
    )
    id: number,
    @Query(new ZodPipe(transactionQuerySchema)) filter: TransactionFilter,
  ) {
    return presentTransactions(
      await this.listTransactions.execute(id, filter),
    );
  }
}
