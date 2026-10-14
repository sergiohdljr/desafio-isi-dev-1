import { z } from 'zod';
import { resourceId } from '../../../../../common/validation/resource-id.js';
import { type TransactionFilter } from '../../../application/repositories/market-repository.js';

const transactionType = z
  .string('Tipo inválido')
  .regex(/^(COMPRA|VENDA)(,(COMPRA|VENDA))?$/, 'Tipo inválido')
  .refine((value) => {
    const parts = value.split(',');
    return new Set(parts).size === parts.length;
  }, 'Tipo inválido')
  .transform((value) => value.split(',') as Array<'COMPRA' | 'VENDA'>);

const playerId = resourceId('Jogador inválido');

export const transactionQuerySchema = z
  .object({
    type: transactionType.optional(),
    player_id: playerId.optional(),
  })
  .strip()
  .transform((query): TransactionFilter => ({
    types: query.type,
    playerId: query.player_id,
  }));

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
