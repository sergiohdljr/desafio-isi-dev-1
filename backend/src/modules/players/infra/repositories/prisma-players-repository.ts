import { Injectable } from '@nestjs/common';
import { releaseLineupSeat } from '../../../league/infra/repositories/release-lineup-seat.js';
import { Player } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../../application/repositories/players-repository.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { playerFromRow } from './player-row.js';

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

  async findActive(): Promise<Player[]> {
    const players = await this.prisma.jogadores.findMany({
      where: { excluido_em: null },
    });
    return players.map(playerFromRow);
  }

  async clubExists(id: number): Promise<boolean> {
    const club = await this.prisma.clubes.findUnique({
      where: { id },
      select: { id: true },
    });
    return club !== null;
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
