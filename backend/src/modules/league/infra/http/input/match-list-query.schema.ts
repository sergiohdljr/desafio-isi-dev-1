import { z } from 'zod';

const MAX_INT32 = 2_147_483_647;

const clubId = z
  .string('Clube inválido')
  .regex(/^[1-9]\d*$/, 'Clube inválido')
  .refine((value) => Number(value) <= MAX_INT32, 'Clube inválido')
  .transform(Number);

export const matchListQuerySchema = z
  .object({
    club_id: clubId.optional(),
  })
  .strip()
  .transform((query) => ({
    clubId: query.club_id,
  }));

export type MatchListQuery = {
  clubId?: number;
};
