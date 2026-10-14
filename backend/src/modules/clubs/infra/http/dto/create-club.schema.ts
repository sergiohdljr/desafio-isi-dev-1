import { z } from 'zod';
import { foldAccents } from '../../../../../shared/domain/name-order.js';
import {
  codePointLength,
  hasControlCharacter,
  normalizeSpaces,
} from '../../../../../shared/text/plain-text.js';

const clubNameSchema = z
  .string('Nome inválido')
  .refine((value) => !hasControlCharacter(value), 'Nome inválido')
  .transform(normalizeSpaces)
  .refine((value) => {
    const length = codePointLength(value);
    return length >= 3 && length <= 60;
  }, 'Nome inválido')
  .refine((value) => {
    if (!Array.from(value).every(isClubNameCharacter)) {
      return false;
    }
    const words = value.split(' ');
    return (
      words.length >= 2 &&
      words.length <= 5 &&
      words.every((word) => /\p{L}/u.test(word))
    );
  }, 'Nome inválido');

const acronymSchema = z
  .string('Sigla inválida')
  .regex(/^[A-Z]{3}$/, 'Sigla inválida')
  .refine(
    (value) => !(value[0] === value[1] && value[1] === value[2]),
    'Sigla inválida',
  );

export const createClubSchema = z
  .object({
    name: clubNameSchema,
    acronym: acronymSchema,
  })
  .strip()
  .superRefine((club, context) => {
    if (!acronymFitsName(club.name, club.acronym)) {
      context.addIssue({ code: 'custom', message: 'Sigla inválida' });
    }
  });

export type CreateClubBody = z.infer<typeof createClubSchema>;

function isClubNameCharacter(character: string): boolean {
  return (
    character === ' ' ||
    character === '-' ||
    character === '.' ||
    /^\p{L}$/u.test(character)
  );
}

function acronymFitsName(name: string, acronym: string): boolean {
  const letters = Array.from(foldAccents(name).toUpperCase()).filter(
    (character) => /^\p{L}$/u.test(character),
  );
  if (letters[0] !== acronym[0]) {
    return false;
  }

  let matched = 0;
  for (const letter of letters) {
    if (letter === acronym[matched]) {
      matched += 1;
    }
    if (matched === acronym.length) {
      return true;
    }
  }
  return false;
}
