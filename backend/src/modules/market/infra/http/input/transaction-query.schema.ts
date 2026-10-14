import { z } from 'zod';
import { type TransactionFilter } from '../../../application/repositories/market-repository.js';

const MAX_INT32 = 2_147_483_647;

const transactionType = z
  .string('Tipo inválido')
  .regex(/^(COMPRA|VENDA)(,(COMPRA|VENDA))?$/, 'Tipo inválido')
  .refine((value) => {
    const parts = value.split(',');
    return new Set(parts).size === parts.length;
  }, 'Tipo inválido')
  .transform((value) => value.split(',') as Array<'COMPRA' | 'VENDA'>);

const playerId = z
  .string('Jogador inválido')
  .regex(/^[1-9]\d*$/, 'Jogador inválido')
  .refine((value) => Number(value) <= MAX_INT32, 'Jogador inválido')
  .transform(Number);

export const transactionQuerySchema = z
  .object({
    type: transactionType.optional(),
    player_id: playerId.optional(),
  })
  .strip()
  .transform(
    (query): TransactionFilter => ({
      types: query.type,
      playerId: query.player_id,
    }),
  );

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
