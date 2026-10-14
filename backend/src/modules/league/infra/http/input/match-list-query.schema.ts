import { z } from 'zod';
import { resourceId } from '../../../../../common/validation/resource-id.js';

const clubId = resourceId('Clube inválido');

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
