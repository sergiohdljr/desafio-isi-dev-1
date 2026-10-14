import { z } from 'zod';
import { POSITIONS } from '../../../domain/types/player-types.js';
import { jsonInt } from './json-int.js';
import { playerNameSchema } from './player-name.js';

export const updatePlayerSchema = z
  .object({
    name: playerNameSchema,
    position: z.enum(POSITIONS, 'Posição inválida'),
    agility: jsonInt(1, 100, 'Agilidade inválida'),
    age: jsonInt(16, 45, 'Idade inválida'),
  })
  .strip();

export type UpdatePlayerBody = z.infer<typeof updatePlayerSchema>;
