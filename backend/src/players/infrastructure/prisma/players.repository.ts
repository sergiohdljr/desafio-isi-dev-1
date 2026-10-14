import { Injectable } from '@nestjs/common';
import { Money } from '../../../shared/domain/money.js';
import { Player } from '../../domain/player.js';
import { Condition, Position } from '../../domain/player-types.js';
import { Players } from '../../domain/players.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

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
export class PrismaPlayersRepository implements Players {
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

    return toPlayer(created);
  }

  async findActiveById(id: number): Promise<Player | null> {
    const player = await this.prisma.jogadores.findFirst({
      where: { id, excluido_em: null },
    });
    return player ? toPlayer(player) : null;
  }

  async findActive(): Promise<Player[]> {
    const players = await this.prisma.jogadores.findMany({
      where: { excluido_em: null },
    });
    return players.map(toPlayer);
  }

  async clubExists(id: number): Promise<boolean> {
    const club = await this.prisma.clubes.findUnique({
      where: { id },
      select: { id: true },
    });
    return club !== null;
  }

  async save(player: Player): Promise<void> {
    await this.prisma.jogadores.update({
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
  }
}

function toPlayer(row: PlayerRow): Player {
  return Player.reconstitute({
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
}
