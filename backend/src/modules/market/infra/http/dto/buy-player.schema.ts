import { z } from 'zod';
import { parseBrasiliaMinute } from '../parse-brasilia-minute.js';

const MAX_INT32 = 2_147_483_647;

export const buyPlayerSchema = z
  .object({
    club_id: z
      .int('Clube inválido')
      .positive('Clube inválido')
      .max(MAX_INT32, 'Clube inválido'),
    loyalty_until: z.string('Fidelidade inválida').transform((value, ctx) => {
      const parsed = parseBrasiliaMinute(value);
      if (!parsed) {
        ctx.addIssue({ code: 'custom', message: 'Fidelidade inválida' });
        return z.NEVER;
      }
      return parsed;
    }),
  })
  .strip()
  .transform((body) => ({
    clubId: body.club_id,
    loyaltyUntil: body.loyalty_until,
  }));

export type BuyPlayerBody = z.infer<typeof buyPlayerSchema>;
