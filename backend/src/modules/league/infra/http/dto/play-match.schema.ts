import { z } from 'zod';
import { MAX_INT32 } from '../../../../../common/validation/resource-id.js';

const clubId = z
  .int('Clube inválido')
  .positive('Clube inválido')
  .max(MAX_INT32, 'Clube inválido');

export const playMatchSchema = z
  .object({
    home_club_id: clubId,
    away_club_id: clubId,
  })
  .strip()
  .refine(
    (body) => body.home_club_id !== body.away_club_id,
    'Mandante e visitante são o mesmo clube',
  )
  .transform((body) => ({
    homeClubId: body.home_club_id,
    awayClubId: body.away_club_id,
  }));

export type PlayMatchBody = {
  homeClubId: number;
  awayClubId: number;
};
