import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { Money } from '../../../../shared/domain/money.js';
import { releaseLineupSeat } from '../../../league/infra/repositories/release-lineup-seat.js';
import {
  playerFromRow,
  type PlayerRow,
} from '../../../players/infra/repositories/player-row.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../../application/policies/decide-purchase.js';
import {
  type SaleFacts,
  type SaleWrite,
} from '../../application/policies/decide-sale.js';
import {
  type MarketRepository,
  type PurchaseReceipt,
  type SaleReceipt,
  type StoredTransaction,
  type TransactionFilter,
} from '../../application/repositories/market-repository.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

type Tx = Prisma.TransactionClient;

@Injectable()
export class PrismaMarketRepository implements MarketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async purchase(
    playerId: number,
    clubId: number,
    settle: (facts: PurchaseFacts) => PurchaseWrite,
  ): Promise<PurchaseReceipt> {
    return this.prisma.$transaction(async (tx) => {
      await lockPurchase(tx, clubId, playerId);
      const loaded = await readPurchase(tx, playerId, clubId);
      const write = settle(loaded.facts);
      if (!loaded.club) {
        throw new Error('Compra sem clube');
      }
      return persistPurchase(tx, { playerId, clubId, write });
    });
  }

  async sale(
    playerId: number,
    settle: (facts: SaleFacts) => SaleWrite,
  ): Promise<SaleReceipt> {
    return this.prisma.$transaction(async (tx) => {
      await lockSale(tx, playerId);
      const loaded = await readSale(tx, playerId);
      const write = settle(loaded.facts);
      if (!loaded.club) {
        throw new Error('Venda sem clube');
      }
      return persistSale(tx, { playerId, write });
    });
  }

  async list(
    clubId: number,
    filter: TransactionFilter,
  ): Promise<StoredTransaction[]> {
    const rows = await this.prisma.transacoes.findMany({
      where: {
        clube_id: clubId,
        ...(filter.types ? { tipo: { in: filter.types } } : {}),
        ...(filter.playerId !== undefined
          ? { jogador_id: filter.playerId }
          : {}),
      },
      orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toStoredTransaction);
  }
}

function toStoredTransaction(row: {
  id: number;
  clube_id: number;
  jogador_id: number;
  nome_jogador: string;
  tipo: 'COMPRA' | 'VENDA';
  valor: { toString(): string };
  taxa: { toString(): string };
  multa: { toString(): string };
  lucro: { toString(): string } | null;
  variacao_caixa: { toString(): string };
  criado_em: Date;
}): StoredTransaction {
  return {
    id: row.id,
    clubId: row.clube_id,
    playerId: row.jogador_id,
    playerName: row.nome_jogador,
    type: row.tipo,
    value: Money.roundHalfAwayFromZero(row.valor.toString()),
    fee: Money.roundHalfAwayFromZero(row.taxa.toString()),
    penalty: Money.roundHalfAwayFromZero(row.multa.toString()),
    profit: row.lucro
      ? Money.roundHalfAwayFromZero(row.lucro.toString())
      : null,
    cashChange: Money.roundHalfAwayFromZero(row.variacao_caixa.toString()),
    createdAt: row.criado_em,
  };
}

function toPurchasePlayer(row: PlayerRow) {
  const player = playerFromRow(row);
  return {
    id: player.id,
    name: player.name,
    clubId: player.clubId,
    marketValue: player.marketValue,
  };
}

async function lockPurchase(
  tx: Tx,
  clubId: number,
  playerId: number,
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
}

async function readPurchase(tx: Tx, playerId: number, clubId: number) {
  const player = await tx.jogadores.findFirst({
    where: { id: playerId, excluido_em: null },
  });
  const club = await tx.clubes.findUnique({ where: { id: clubId } });
  const squadSize = club
    ? await tx.jogadores.count({
        where: { clube_id: clubId, excluido_em: null },
      })
    : 0;
  const previousSale =
    player && club
      ? await tx.transacoes.findFirst({
          where: {
            clube_id: clubId,
            jogador_id: playerId,
            tipo: 'VENDA',
          },
          select: { id: true },
        })
      : null;
  return {
    club,
    facts: {
      player: player ? toPurchasePlayer(player) : null,
      club: club
        ? {
            id: club.id,
            cash: Money.roundHalfAwayFromZero(club.caixa.toString()),
            squadSize,
          }
        : null,
      previouslySoldByClub: previousSale !== null,
    } satisfies PurchaseFacts,
  };
}

async function persistPurchase(
  tx: Tx,
  purchase: {
    playerId: number;
    clubId: number;
    write: PurchaseWrite;
  },
): Promise<PurchaseReceipt> {
  await tx.jogadores.update({
    where: { id: purchase.playerId },
    data: { clube_id: purchase.clubId },
  });
  const club = await tx.clubes.update({
    where: { id: purchase.clubId },
    data: { caixa: { increment: purchase.write.cashChange.toDecimalString() } },
  });
  const clubCash = Money.roundHalfAwayFromZero(club.caixa.toString());
  await tx.contratos.create({
    data: {
      jogador_id: purchase.playerId,
      clube_id: purchase.clubId,
      valor_compra: purchase.write.value.toDecimalString(),
      fidelidade_ate: purchase.write.loyaltyUntil,
      situacao: 'ATIVO',
      iniciado_em: purchase.write.at,
    },
  });
  const created = await tx.transacoes.create({
    data: {
      clube_id: purchase.clubId,
      jogador_id: purchase.playerId,
      nome_jogador: purchase.write.playerName,
      tipo: 'COMPRA',
      valor: purchase.write.value.toDecimalString(),
      taxa: purchase.write.fee.toDecimalString(),
      multa: '0.00',
      lucro: null,
      variacao_caixa: purchase.write.cashChange.toDecimalString(),
      criado_em: purchase.write.at,
    },
  });
  return {
    id: created.id,
    clubId: purchase.clubId,
    playerId: purchase.playerId,
    playerName: purchase.write.playerName,
    value: purchase.write.value,
    fee: purchase.write.fee,
    cashChange: purchase.write.cashChange,
    createdAt: purchase.write.at,
    loyaltyUntil: purchase.write.loyaltyUntil,
    clubCash,
  };
}

async function lockSale(tx: Tx, playerId: number): Promise<void> {
  const peek = await tx.jogadores.findFirst({
    where: { id: playerId, excluido_em: null },
    select: { clube_id: true },
  });
  if (peek?.clube_id) {
    await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${peek.clube_id} FOR UPDATE`;
  }
  await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
}

async function readSale(tx: Tx, playerId: number) {
  const player = await tx.jogadores.findFirst({
    where: { id: playerId, excluido_em: null },
  });
  const club = player?.clube_id
    ? await tx.clubes.findUnique({ where: { id: player.clube_id } })
    : null;
  const active = player?.clube_id
    ? await tx.contratos.findFirst({
        where: {
          jogador_id: playerId,
          clube_id: player.clube_id,
          situacao: 'ATIVO',
        },
        orderBy: { iniciado_em: 'desc' },
      })
    : null;
  return {
    club,
    facts: {
      player: player ? toPurchasePlayer(player) : null,
      clubCash: club
        ? Money.roundHalfAwayFromZero(club.caixa.toString())
        : null,
      contract: active
        ? {
            purchaseValue: Money.roundHalfAwayFromZero(
              active.valor_compra.toString(),
            ),
            loyaltyUntil: active.fidelidade_ate,
          }
        : null,
    } satisfies SaleFacts,
  };
}

async function persistSale(
  tx: Tx,
  sale: {
    playerId: number;
    write: SaleWrite;
  },
): Promise<SaleReceipt> {
  await tx.jogadores.update({
    where: { id: sale.playerId },
    data: { clube_id: null },
  });
  await releaseLineupSeat(tx, sale.playerId);
  const club = await tx.clubes.update({
    where: { id: sale.write.clubId },
    data: { caixa: { increment: sale.write.cashChange.toDecimalString() } },
  });
  const clubCash = Money.roundHalfAwayFromZero(club.caixa.toString());
  await tx.contratos.updateMany({
    where: {
      jogador_id: sale.playerId,
      clube_id: sale.write.clubId,
      situacao: 'ATIVO',
    },
    data: { situacao: sale.write.contractStatus, encerrado_em: sale.write.at },
  });
  const created = await tx.transacoes.create({
    data: {
      clube_id: sale.write.clubId,
      jogador_id: sale.playerId,
      nome_jogador: sale.write.playerName,
      tipo: 'VENDA',
      valor: sale.write.value.toDecimalString(),
      taxa: sale.write.fee.toDecimalString(),
      multa: sale.write.penalty.toDecimalString(),
      lucro: sale.write.profit.toDecimalString(),
      variacao_caixa: sale.write.cashChange.toDecimalString(),
      criado_em: sale.write.at,
    },
  });
  return {
    id: created.id,
    clubId: sale.write.clubId,
    playerId: sale.playerId,
    playerName: sale.write.playerName,
    value: sale.write.value,
    fee: sale.write.fee,
    penalty: sale.write.penalty,
    profit: sale.write.profit,
    cashChange: sale.write.cashChange,
    createdAt: sale.write.at,
    purchaseValue: sale.write.purchaseValue,
    remainingDays: sale.write.remainingDays,
    penaltyRate: sale.write.penaltyRate,
    contractStatus: sale.write.contractStatus,
    clubCash,
  };
}
