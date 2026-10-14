import { z } from 'zod';
import {
  CLUB_SORTS,
  type ClubListQuery,
} from '../../../application/queries/club-list-query.js';

export const clubListQuerySchema = z
  .object({
    sort: z.enum(CLUB_SORTS, 'Ordenação inválida').optional().default('name'),
  })
  .strip()
  .transform((query): ClubListQuery => ({ sort: query.sort }));
