import { Injectable } from '@nestjs/common';
import { Money } from '../../../../shared/domain/money.js';
import { Player } from '../../../players/domain/entities/player.js';
import {
  type Condition,
  type Position,
} from '../../../players/domain/types/player-types.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../../application/policies/decide-purchase.js';
import {
  type MarketRepository,
  type PurchaseReceipt,
} from '../../application/repositories/market-repository.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

type PlayerRow = {
  id: number;
  nome: string;
  posicao: Position;
  agilidade: number;
  idade: number;
  valor_base: { toString(): string };
  condicao: Condition;
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
  potencial: number;
  clube_id: number | null;
};

@Injectable()
export class PrismaMarketRepository implements MarketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async purchase(
    playerId: number,
    clubId: number,
    settle: (facts: PurchaseFacts) => PurchaseWrite,
  ): Promise<PurchaseReceipt> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;

      const player = await tx.jogadores.findFirst({
        where: { id: playerId, excluido_em: null },
      });
      const club = await tx.clubes.findUnique({ where: { id: clubId } });
      const squadSize = club
        ? await tx.jogadores.count({
            where: { clube_id: clubId, excluido_em: null },
          })
        : 0;
      const write = settle({
        player: player ? toPurchasePlayer(player) : null,
        club: club
          ? {
              id: club.id,
              cash: Money.roundHalfAwayFromZero(club.caixa.toString()),
              squadSize,
            }
          : null,
      });
      if (!club) {
        throw new Error('Compra sem clube');
      }

      const clubCash = Money.fromCents(
        Money.roundHalfAwayFromZero(club.caixa.toString()).cents +
          write.cashChange.cents,
      );
      await tx.jogadores.update({
        where: { id: playerId },
        data: { clube_id: clubId },
      });
      await tx.clubes.update({
        where: { id: clubId },
        data: { caixa: clubCash.toDecimalString() },
      });
      await tx.contratos.create({
        data: {
          jogador_id: playerId,
          clube_id: clubId,
          valor_compra: write.value.toDecimalString(),
          fidelidade_ate: write.loyaltyUntil,
          situacao: 'ATIVO',
          iniciado_em: write.at,
        },
      });
      const created = await tx.transacoes.create({
        data: {
          clube_id: clubId,
          jogador_id: playerId,
          nome_jogador: write.playerName,
          tipo: 'COMPRA',
          valor: write.value.toDecimalString(),
          taxa: write.fee.toDecimalString(),
          multa: '0.00',
          lucro: null,
          variacao_caixa: write.cashChange.toDecimalString(),
          criado_em: write.at,
        },
      });

      return {
        id: created.id,
        clubId,
        playerId,
        playerName: write.playerName,
        value: write.value,
        fee: write.fee,
        cashChange: write.cashChange,
        createdAt: write.at,
        loyaltyUntil: write.loyaltyUntil,
        clubCash,
      };
    });
  }
}

function toPurchasePlayer(row: PlayerRow) {
  const player = Player.reconstitute({
    id: row.id,
    name: row.nome,
    position: row.posicao,
    agility: row.agilidade,
    age: row.idade,
    condition: row.condicao,
    baseValue: Money.roundHalfAwayFromZero(row.valor_base.toString()),
    pace: row.velocidade,
    shooting: row.finalizacao,
    passing: row.passe,
    dribbling: row.drible,
    defending: row.defesa,
    physical: row.fisico,
    potential: row.potencial,
    clubId: row.clube_id,
    excluded: false,
  });
  return {
    id: player.id,
    name: player.name,
    clubId: player.clubId,
    marketValue: player.marketValue,
  };
}
