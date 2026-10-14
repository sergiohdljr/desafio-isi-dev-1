import { z } from 'zod';

const MAX_INT32 = 2_147_483_647;

export const clubIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .refine((id) => id <= MAX_INT32);
