import { z } from 'zod';
import { CONDITIONS } from '../../../domain/types/player-types.js';

export const updateConditionSchema = z
  .object({
    condition: z.enum(CONDITIONS, 'Condição inválida'),
  })
  .strip();

export type UpdateConditionBody = z.infer<typeof updateConditionSchema>;
