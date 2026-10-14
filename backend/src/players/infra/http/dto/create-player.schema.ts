import { z } from 'zod';
import { POSITIONS } from '../../../domain/types/player-types.js';
import { jsonInt } from './json-int.js';
import { playerNameSchema } from './player-name.js';

const skill = jsonInt(1, 99, 'Indicador inválido');

export const createPlayerSchema = z
  .object({
    name: playerNameSchema,
    position: z.enum(POSITIONS, 'Posição inválida'),
    agility: jsonInt(1, 100, 'Agilidade inválida'),
    age: jsonInt(16, 45, 'Idade inválida'),
    pace: skill,
    shooting: skill,
    passing: skill,
    dribbling: skill,
    defending: skill,
    physical: skill,
    potential: jsonInt(1, 99, 'Potencial inválido'),
  })
  .strip();

export type CreatePlayerBody = z.infer<typeof createPlayerSchema>;
