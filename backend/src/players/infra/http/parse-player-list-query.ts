import { BadRequestException } from '@nestjs/common';
import {
  type PlayerListQuery,
  type PlayerSort,
} from '../../application/use-cases/player-list-query.js';
import { CONDITIONS, POSITIONS } from '../../domain/entities/player-types.js';
import { codePointLength } from './player-text.js';

const MAX_INT32 = 2_147_483_647;
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

const positions = new Set<string>(POSITIONS);
const conditions = new Set<string>(CONDITIONS);

export function parsePlayerListQuery(value: unknown): PlayerListQuery {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Consulta inválida');
  }

  const query = value as Record<string, unknown>;
  const search = readSearch(query);
  const position = readEnum(query, 'position', positions);
  const condition = readEnum(query, 'condition', conditions);
  const free = readFree(query);
  const clubId = readInteger(query, 'club_id', 1, MAX_INT32);
  const minAge = readInteger(query, 'min_age', 16, 45);
  const maxAge = readInteger(query, 'max_age', 16, 45);
  const minValue = readDecimal(query, 'min_value');
  const maxValue = readDecimal(query, 'max_value');

  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    throw new BadRequestException(
      'A idade mínima não pode ser maior que a máxima',
    );
  }
  if (
    minValue !== undefined &&
    maxValue !== undefined &&
    cents(minValue) > cents(maxValue)
  ) {
    throw new BadRequestException(
      'O valor mínimo não pode ser maior que o máximo',
    );
  }
  if (free === true && clubId !== undefined) {
    throw new BadRequestException('Livre e clube não podem ser combinados');
  }

  return {
    search,
    position: position as PlayerListQuery['position'],
    condition: condition as PlayerListQuery['condition'],
    free,
    clubId,
    minAge,
    maxAge,
    minValue,
    maxValue,
    sorts: readSort(query),
    page: readInteger(query, 'page', 1, MAX_INT32) ?? 1,
    limit: readInteger(query, 'limit', 1, 50) ?? 10,
  };
}

function readSearch(query: Record<string, unknown>): string | undefined {
  const raw = readRaw(query, 'search');
  if (raw === undefined) {
    return undefined;
  }
  if (hasControlCharacter(raw)) {
    throw new BadRequestException('Busca inválida');
  }

  const search = raw.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
  const length = codePointLength(search);
  if (length < 2 || length > 100) {
    throw new BadRequestException('Busca inválida');
  }

  return search;
}

function readEnum(
  query: Record<string, unknown>,
  key: string,
  allowed: Set<string>,
): string | undefined {
  const raw = readRaw(query, key);
  if (raw === undefined) {
    return undefined;
  }
  if (!allowed.has(raw)) {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  return raw;
}

function readFree(query: Record<string, unknown>): boolean | undefined {
  const raw = readRaw(query, 'free');
  if (raw === undefined) {
    return undefined;
  }
  if (raw !== 'true' && raw !== 'false') {
    throw new BadRequestException('Parâmetro free inválido');
  }

  return raw === 'true';
}

function readSort(query: Record<string, unknown>): PlayerSort[] {
  const raw = readRaw(query, 'sort');
  if (raw === undefined) {
    return ['name'];
  }
  if (raw.includes(' ') || raw.startsWith(',') || raw.endsWith(',')) {
    throw new BadRequestException('Ordenação inválida');
  }

  const parts = raw.split(',');
  if (parts.length > 2) {
    throw new BadRequestException('Ordenação inválida');
  }

  const fields = new Set<string>();
  const sorts: PlayerSort[] = [];
  for (const part of parts) {
    if (!isSort(part) || fields.has(sortField[part])) {
      throw new BadRequestException('Ordenação inválida');
    }
    fields.add(sortField[part]);
    sorts.push(part);
  }

  return sorts;
}

function readInteger(
  query: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
): number | undefined {
  const raw = readRaw(query, key);
  if (raw === undefined) {
    return undefined;
  }
  if (!INTEGER.test(raw)) {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  return parsed;
}

function readDecimal(
  query: Record<string, unknown>,
  key: string,
): number | undefined {
  const raw = readRaw(query, key);
  if (raw === undefined) {
    return undefined;
  }
  if (!DECIMAL.test(raw)) {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  const parsed = Number(raw);
  if (cents(parsed) < 0 || cents(parsed) > 55000) {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  return parsed;
}

function readRaw(
  query: Record<string, unknown>,
  key: string,
): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(query, key)) {
    return undefined;
  }

  const value = query[key];
  if (typeof value !== 'string' || value === '') {
    throw new BadRequestException(`Parâmetro ${key} inválido`);
  }

  return value;
}

function isSort(value: string): value is PlayerSort {
  return (SORTS as readonly string[]).includes(value);
}

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

function cents(value: number): number {
  return Math.round(value * 100);
}
