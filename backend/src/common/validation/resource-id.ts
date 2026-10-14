import { z } from 'zod';

export const MAX_INT32 = 2_147_483_647;

const digits = /^[1-9]\d*$/;

export function resourceId(message: string) {
  return z
    .string(message)
    .regex(digits, message)
    .refine((value) => Number(value) <= MAX_INT32, message)
    .transform(Number);
}

export const resourceIdSchema = resourceId('Id inválido');
