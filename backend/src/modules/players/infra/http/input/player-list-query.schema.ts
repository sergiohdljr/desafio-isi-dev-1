import { z } from 'zod';
import {
  MAX_INT32,
  resourceId,
} from '../../../../../common/validation/resource-id.js';
import {
  type PlayerListQuery,
  type PlayerSort,
} from '../../../application/queries/player-list-query.js';
import { CONDITIONS, POSITIONS } from '../../../domain/types/player-types.js';
import {
  codePointLength,
  hasControlCharacter,
  normalizeSpaces,
} from '../../../../../shared/text/plain-text.js';

const INTEGER = /^[1-9]\d*$/;
const DECIMAL = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const SORTS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;

const sortField: Record<PlayerSort, string> = {
  name: 'name',
  value_asc: 'value',
  value_desc: 'value',
  age_asc: 'age',
  age_desc: 'age',
  position: 'position',
};

function queryInteger(min: number, max: number, message: string) {
  return z
    .string(message)
    .regex(INTEGER, message)
    .transform(Number)
    .refine(
      (value) => Number.isSafeInteger(value) && value >= min && value <= max,
      message,
    );
}

function queryDecimal(message: string) {
  return z
    .string(message)
    .regex(DECIMAL, message)
    .transform(Number)
    .refine((value) => {
      const cents = Math.round(value * 100);
      return cents >= 0 && cents <= 55_000;
    }, message)
    .optional();
}

function isSort(value: string): value is PlayerSort {
  return (SORTS as readonly string[]).includes(value);
}

const sortSchema = z
  .string('Ordenação inválida')
  .superRefine((raw, context) => {
    if (
      raw === '' ||
      raw.includes(' ') ||
      raw.startsWith(',') ||
      raw.endsWith(',')
    ) {
      context.addIssue({ code: 'custom', message: 'Ordenação inválida' });
      return;
    }

    const parts = raw.split(',');
    if (parts.length > 2) {
      context.addIssue({ code: 'custom', message: 'Ordenação inválida' });
      return;
    }

    const fields = new Set<string>();
    for (const part of parts) {
      if (!isSort(part) || fields.has(sortField[part])) {
        context.addIssue({ code: 'custom', message: 'Ordenação inválida' });
        return;
      }
      fields.add(sortField[part]);
    }
  })
  .transform((raw) => raw.split(',') as PlayerSort[])
  .optional()
  .default(['name']);

export const playerListQuerySchema = z
  .object({
    search: z
      .string('Busca inválida')
      .min(1, 'Busca inválida')
      .transform(normalizeSpaces)
      .refine(
        (value) =>
          !hasControlCharacter(value) &&
          codePointLength(value) >= 2 &&
          codePointLength(value) <= 100,
        'Busca inválida',
      )
      .optional(),
    position: z.enum(POSITIONS, 'Parâmetro position inválido').optional(),
    condition: z.enum(CONDITIONS, 'Parâmetro condition inválido').optional(),
    free: z
      .enum(['true', 'false'], 'Parâmetro free inválido')
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === 'true',
      ),
    club_id: resourceId('Parâmetro club_id inválido').optional(),
    min_age: queryInteger(16, 45, 'Parâmetro min_age inválido').optional(),
    max_age: queryInteger(16, 45, 'Parâmetro max_age inválido').optional(),
    min_value: queryDecimal('Parâmetro min_value inválido'),
    max_value: queryDecimal('Parâmetro max_value inválido'),
    sort: sortSchema,
    page: queryInteger(1, MAX_INT32, 'Parâmetro page inválido')
      .optional()
      .default(1),
    limit: queryInteger(1, 50, 'Parâmetro limit inválido')
      .optional()
      .default(10),
  })
  .strip()
  .superRefine((query, context) => {
    if (
      query.min_age !== undefined &&
      query.max_age !== undefined &&
      query.min_age > query.max_age
    ) {
      context.addIssue({
        code: 'custom',
        message: 'A idade mínima não pode ser maior que a máxima',
      });
    }
    if (
      query.min_value !== undefined &&
      query.max_value !== undefined &&
      Math.round(query.min_value * 100) > Math.round(query.max_value * 100)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'O valor mínimo não pode ser maior que o máximo',
      });
    }
    if (query.free === true && query.club_id !== undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Livre e clube não podem ser combinados',
      });
    }
  })
  .transform((query): PlayerListQuery => ({
    search: query.search,
    position: query.position,
    condition: query.condition,
    free: query.free,
    clubId: query.club_id,
    minAge: query.min_age,
    maxAge: query.max_age,
    minValue: query.min_value,
    maxValue: query.max_value,
    sorts: query.sort,
    page: query.page,
    limit: query.limit,
  }));
