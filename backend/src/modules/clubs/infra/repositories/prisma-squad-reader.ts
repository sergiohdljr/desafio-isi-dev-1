import { Injectable } from '@nestjs/common';
import { playerFromRow } from '../../../players/infra/repositories/player-row.js';
import { Money } from '../../../../shared/domain/money.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  type SquadMember,
  type SquadReader,
} from '../../application/repositories/squad-reader.js';

@Injectable()
export class PrismaSquadReader implements SquadReader {
  constructor(private readonly prisma: PrismaService) {}

  async listByClub(clubId: number): Promise<SquadMember[]> {
    const rows = await this.prisma.jogadores.findMany({
      where: { clube_id: clubId, excluido_em: null },
      include: {
        contratos: {
          where: { clube_id: clubId, situacao: 'ATIVO' },
          orderBy: { iniciado_em: 'desc' },
          take: 1,
        },
      },
    });

    return rows.flatMap((row) => {
      const [contract] = row.contratos;
      if (!contract) {
        return [];
      }
      return [
        {
          clubId,
          player: playerFromRow(row),
          purchaseValue: Money.roundHalfAwayFromZero(
            contract.valor_compra.toString(),
          ),
          loyaltyUntil: contract.fidelidade_ate,
        },
      ];
    });
  }

  async squadValues(): Promise<Map<number, Money>> {
    const rows = await this.prisma.$queryRaw<
      { clube_id: number; total: string }[]
    >`
      SELECT clube_id,
             sum(valor_mercado(valor_base, condicao, agilidade, idade))::text AS total
      FROM jogadores
      WHERE excluido_em IS NULL AND clube_id IS NOT NULL
      GROUP BY clube_id
    `;

    return new Map(
      rows.map((row) => [row.clube_id, Money.roundHalfAwayFromZero(row.total)]),
    );
  }
}
