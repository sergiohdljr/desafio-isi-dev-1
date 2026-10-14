import { z } from 'zod';

export function jsonInt(min: number, max: number, message: string) {
  return z.int(message).min(min, message).max(max, message);
}
