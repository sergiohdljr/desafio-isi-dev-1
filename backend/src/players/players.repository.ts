import { Injectable } from '@nestjs/common';
import { condicao, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';

@Injectable()
export class PlayersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(player: CreatePlayerDto, baseValue: Prisma.Decimal) {
    return this.prisma.jogadores.create({
      data: {
        nome: player.name,
        posicao: player.position,
        agilidade: player.agility,
        idade: player.age,
        valor_base: baseValue,
        condicao: condicao.APTO,
        velocidade: player.pace,
        finalizacao: player.shooting,
        passe: player.passing,
        drible: player.dribbling,
        defesa: player.defending,
        fisico: player.physical,
        potencial: player.potential,
      },
    });
  }

  findActiveById(id: number) {
    return this.prisma.jogadores.findFirst({
      where: { id, excluido_em: null },
    });
  }

  findActive() {
    return this.prisma.jogadores.findMany({
      where: { excluido_em: null },
    });
  }

  clubExists(id: number) {
    return this.prisma.clubes.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  update(id: number, player: UpdatePlayerDto) {
    return this.prisma.jogadores.update({
      where: { id },
      data: {
        nome: player.name,
        posicao: player.position,
        agilidade: player.agility,
        idade: player.age,
      },
    });
  }

  markDeleted(id: number) {
    return this.prisma.jogadores.update({
      where: { id },
      data: { excluido_em: new Date() },
    });
  }

  updateCondition(id: number, condition: condicao) {
    return this.prisma.jogadores.update({
      where: { id },
      data: { condicao: condition },
    });
  }
}
