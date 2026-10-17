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

  async list(): Promise<SquadMember[]> {
    const rows = await this.prisma.jogadores.findMany({
      where: {
        excluido_em: null,
        clube_id: { not: null },
      },
      include: {
        contratos: {
          where: { situacao: 'ATIVO' },
          orderBy: { iniciado_em: 'desc' },
        },
      },
    });

    return rows.flatMap((row) => {
      const contract = row.contratos.find(
        (item) => item.clube_id === row.clube_id,
      );
      if (!contract || row.clube_id === null) {
        return [];
      }
      return [
        {
          clubId: row.clube_id,
          player: playerFromRow(row),
          purchaseValue: Money.roundHalfAwayFromZero(
            contract.valor_compra.toString(),
          ),
          loyaltyUntil: contract.fidelidade_ate,
        },
      ];
    });
  }
}
