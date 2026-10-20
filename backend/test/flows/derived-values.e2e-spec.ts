import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Money } from '../../src/shared/domain/money.js';
import { foldName } from '../../src/shared/domain/name-order.js';
import { marketValueOf } from '../../src/modules/players/domain/services/player-valuation.js';
import { CONDITIONS } from '../../src/modules/players/domain/types/player-types.js';
import { closeLeague, openLeague } from '../league-app.js';
import { prismaOf } from './api.js';

const BASE_VALUES = ['1.00', '12.34', '36.00', '99.99', '550.00'];
const AGILITIES = [0, 30, 31, 79, 80, 100];
const AGES = [16, 21, 22, 31, 32, 45];

const NAMES = [
  'Agustín Peña',
  'João Gonçalves',
  'ÂNGELO ÍTALO',
  'Müller Çelik',
  'Ana Lima',
  'ana lima',
];

describe('Valores derivados no banco', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await openLeague();
  });

  afterAll(async () => {
    await closeLeague(app);
  });

  it('calcula valor_mercado igual a marketValueOf em toda a matriz da RN05', async () => {
    const rows = await prismaOf(app).$queryRaw<
      {
        valor_base: string;
        condicao: string;
        agilidade: number;
        idade: number;
        resultado: string;
      }[]
    >`
      SELECT
        valor_base::text AS valor_base,
        condicao::text AS condicao,
        agilidade,
        idade,
        valor_mercado(valor_base, condicao, agilidade, idade)::text AS resultado
      FROM unnest(${BASE_VALUES}::numeric[]) AS valor_base
      CROSS JOIN unnest(${[...CONDITIONS]}::condicao[]) AS condicao
      CROSS JOIN unnest(${AGILITIES}::int[]) AS agilidade
      CROSS JOIN unnest(${AGES}::int[]) AS idade
    `;

    expect(rows).toHaveLength(
      BASE_VALUES.length * CONDITIONS.length * AGILITIES.length * AGES.length,
    );

    const divergences = rows.filter((row) => {
      const expected = marketValueOf(
        Money.roundHalfAwayFromZero(row.valor_base),
        row.condicao as (typeof CONDITIONS)[number],
        row.agilidade,
        row.idade,
      );
      return (
        Money.roundHalfAwayFromZero(row.resultado).cents !== expected.cents
      );
    });

    expect(divergences).toEqual([]);
  });

  it('aplica o teto de desconto e o piso de um centavo da RN05', async () => {
    const [row] = await prismaOf(app).$queryRaw<
      { teto: string; piso: string }[]
    >`
      SELECT
        valor_mercado(100.00, 'DOENTE', 30, 32)::text AS teto,
        valor_mercado(1.00, 'DOENTE', 30, 32)::text AS piso
    `;

    expect(Number(row.teto)).toBe(60);
    expect(Number(row.piso)).toBe(1);
  });

  it('dobra nomes igual a foldName para o alfabeto latino usado em nomes', async () => {
    const rows = await prismaOf(app).$queryRaw<
      { original: string; dobrado: string }[]
    >`
      SELECT nome AS original, nome_dobrado(nome) AS dobrado
      FROM unnest(${NAMES}::text[]) AS nome
    `;

    for (const row of rows) {
      expect(row.dobrado).toBe(foldName(row.original));
    }
  });

  it('dobra além do NFD onde o dicionário do unaccent tem regra própria', async () => {
    const [row] = await prismaOf(app).$queryRaw<
      { ligadura: string; cortado: string }[]
    >`
      SELECT nome_dobrado('Straße') AS ligadura, nome_dobrado('Søren') AS cortado
    `;

    expect(row.ligadura).toBe('strasse');
    expect(row.cortado).toBe('soren');
    expect(foldName('Straße')).toBe('straße');
    expect(foldName('Søren')).toBe('søren');
  });
});
