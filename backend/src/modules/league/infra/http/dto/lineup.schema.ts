import { z } from 'zod';
import { FORMATIONS, type Formation } from '../../../domain/formation.js';

const MAX_INT32 = 2_147_483_647;

const starterId = z
  .int('Titular inválido')
  .positive('Titular inválido')
  .max(MAX_INT32, 'Titular inválido');

export const lineupSchema = z
  .object({
    formation: z.enum(FORMATIONS, 'Formação inválida'),
    player_ids: z
      .array(starterId, 'Titulares inválidos')
      .length(5, 'Titulares inválidos')
      .refine((ids) => new Set(ids).size === ids.length, 'Titulares inválidos'),
  })
  .strip()
  .transform((body) => ({
    formation: body.formation,
    playerIds: body.player_ids,
  }));

export type LineupBody = {
  formation: Formation;
  playerIds: number[];
};
