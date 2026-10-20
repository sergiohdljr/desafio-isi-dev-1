import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { releaseLineupSeat } from '../../../league/infra/repositories/release-lineup-seat.js';
import { Player } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../../application/repositories/players-repository.js';
import { type PlayerListPage } from '../../application/queries/player-list.js';
import {
  AGE_RANGE,
  VALUE_RANGE,
  type PlayerListQuery,
  type PlayerSort,
} from '../../application/queries/player-list-query.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { playerFromRow, type PlayerRow } from './player-row.js';

const marketValue = Prisma.sql`valor_mercado(valor_base, condicao, agilidade, idade)`;
const foldedName = Prisma.sql`nome_dobrado(nome)`;
/// COLLATE "C" ordena por code point, igual ao compareNames do domínio.
const foldedNameOrder = Prisma.sql`nome_dobrado(nome) COLLATE "C"`;

const orderFragments: Record<PlayerSort, Prisma.Sql> = {
  name: Prisma.sql`${foldedNameOrder} ASC`,
  value_asc: Prisma.sql`${marketValue} ASC`,
  value_desc: Prisma.sql`${marketValue} DESC`,
  age_asc: Prisma.sql`idade ASC`,
  age_desc: Prisma.sql`idade DESC`,
  position: Prisma.sql`posicao ASC`,
};

@Injectable()
export class PrismaPlayersRepository implements PlayersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(player: Player): Promise<Player> {
    const created = await this.prisma.jogadores.create({
      data: {
        nome: player.name,
        posicao: player.position,
        agilidade: player.agility,
        idade: player.age,
        valor_base: player.baseValue.toDecimalString(),
        condicao: player.condition,
        velocidade: player.pace,
        finalizacao: player.shooting,
        passe: player.passing,
        drible: player.dribbling,
        defesa: player.defending,
        fisico: player.physical,
        potencial: player.potential,
      },
    });

    return playerFromRow(created);
  }

  async findActiveById(id: number): Promise<Player | null> {
    const player = await this.prisma.jogadores.findFirst({
      where: { id, excluido_em: null },
    });
    return player ? playerFromRow(player) : null;
  }

  async findActivePage(query: PlayerListQuery): Promise<PlayerListPage> {
    const where = whereOf(query);
    const { rows, totals } = await this.prisma.$transaction(async (tx) => ({
      rows: await tx.$queryRaw<PlayerRow[]>`
        SELECT id, nome, posicao, agilidade, idade, valor_base, condicao,
               velocidade, finalizacao, passe, drible, defesa, fisico,
               potencial, clube_id
        FROM jogadores
        WHERE ${where}
        ORDER BY ${orderOf(query.sorts)}
        LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}
      `,
      totals: await tx.$queryRaw<{ total: number }[]>`
        SELECT count(*)::int AS total FROM jogadores WHERE ${where}
      `,
    }));

    const totalItems = totals[0]?.total ?? 0;
    return {
      data: rows.map(playerFromRow),
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    };
  }

  async save(player: Player): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (player.clubId !== null && player.condition === 'DOENTE') {
        await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${player.clubId} FOR UPDATE`;
      }
      await tx.jogadores.update({
        where: { id: player.id },
        data: {
          nome: player.name,
          posicao: player.position,
          agilidade: player.agility,
          idade: player.age,
          condicao: player.condition,
          ...(player.excluded ? { excluido_em: new Date() } : {}),
        },
      });
      if (player.condition === 'DOENTE') {
        await releaseLineupSeat(tx, player.id);
      }
    });
  }
}

function whereOf(query: PlayerListQuery): Prisma.Sql {
  const parts = [Prisma.sql`excluido_em IS NULL`];

  if (query.search !== undefined) {
    parts.push(
      Prisma.sql`${foldedName} LIKE nome_dobrado(${likePattern(query.search)})`,
    );
  }
  if (query.position !== undefined) {
    parts.push(Prisma.sql`posicao = ${query.position}::posicao`);
  }
  if (query.condition !== undefined) {
    parts.push(Prisma.sql`condicao = ${query.condition}::condicao`);
  }
  if (query.free !== undefined) {
    parts.push(
      query.free
        ? Prisma.sql`clube_id IS NULL`
        : Prisma.sql`clube_id IS NOT NULL`,
    );
  }
  if (query.clubId !== undefined) {
    parts.push(Prisma.sql`clube_id = ${query.clubId}`);
  }
  if (query.minAge !== undefined || query.maxAge !== undefined) {
    parts.push(
      Prisma.sql`idade BETWEEN ${query.minAge ?? AGE_RANGE.min} AND ${query.maxAge ?? AGE_RANGE.max}`,
    );
  }
  if (query.minValue !== undefined || query.maxValue !== undefined) {
    parts.push(
      Prisma.sql`${marketValue} BETWEEN ${decimal(query.minValue ?? VALUE_RANGE.min)}::numeric AND ${decimal(query.maxValue ?? VALUE_RANGE.max)}::numeric`,
    );
  }

  return Prisma.join(parts, ' AND ');
}

function orderOf(sorts: PlayerSort[]): Prisma.Sql {
  const fragments = sorts.map((sort) => orderFragments[sort]);
  return Prisma.join(
    [...fragments, Prisma.sql`${foldedNameOrder} ASC, id ASC`],
    ', ',
  );
}

/// O domínio compara substring literal; em LIKE os curingas precisam de escape.
function likePattern(search: string): string {
  return `%${search.replace(/[\\%_]/g, '\\$&')}%`;
}

function decimal(value: number): string {
  return value.toFixed(2);
}
