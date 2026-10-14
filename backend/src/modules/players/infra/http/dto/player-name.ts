import { z } from 'zod';
import {
  codePointLength,
  hasControlCharacter,
  normalizeSpaces,
} from '../../../../../shared/text/plain-text.js';

export const playerNameSchema = z
  .string('Nome inválido')
  .transform(normalizeSpaces)
  .refine((value) => !hasControlCharacter(value), 'Nome inválido')
  .refine((value) => !/[0-9]/.test(value), 'Nome inválido')
  .refine((value) => {
    const length = codePointLength(value);
    return length >= 3 && length <= 100;
  }, 'Nome inválido')
  .refine((value) => {
    const words = value.split(' ');
    return (
      words.length >= 2 &&
      words.every((word) => word.length > 0 && /\p{L}/u.test(word))
    );
  }, 'Nome inválido');
