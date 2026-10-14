import { Injectable } from '@nestjs/common';
import { Player } from '../../../players/domain/entities/player.js';
import {
  type Condition,
  type Position,
} from '../../../players/domain/types/player-types.js';
import { DomainError } from '../../../shared/domain/domain-error.js';
import { Money } from '../../../shared/domain/money.js';
import { Club, MAX_CLUBS } from '../../domain/entities/club.js';
import {
  type ClubsRepository,
  type SquadMember,
} from '../../application/repositories/clubs-repository.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

type ClubRow = {
  id: number;
  nome: string;
  sigla: string;
  caixa: { toString(): string };
};

@Injectable()
export class PrismaClubsRepository implements ClubsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(club: Club): Promise<Club> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`LOCK TABLE clubes IN SHARE ROW EXCLUSIVE MODE`;
        const count = await tx.clubes.count();
        if (count >= MAX_CLUBS) {
          throw new DomainError(
            'conflict',
            'A liga aceita no máximo 20 clubes',
          );
        }

        const created = await tx.clubes.create({
          data: {
            nome: club.name,
            sigla: club.acronym,
            caixa: club.cash.toDecimalString(),
          },
        });
        return toClub(created);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError('conflict', 'Nome ou sigla já cadastrado');
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Club | null> {
    const club = await this.prisma.clubes.findUnique({ where: { id } });
    return club ? toClub(club) : null;
  }

  async count(): Promise<number> {
    return this.prisma.clubes.count();
  }

  async nameTaken(name: string): Promise<boolean> {
    const club = await this.prisma.clubes.findFirst({
      where: { nome: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    return club !== null;
  }

  async list(): Promise<Club[]> {
    const clubs = await this.prisma.clubes.findMany();
    return clubs.map(toClub);
  }

  async squad(): Promise<SquadMember[]> {
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
          player: toSquadPlayer(row),
          purchaseValue: Money.roundHalfAwayFromZero(
            contract.valor_compra.toString(),
          ),
          loyaltyUntil: contract.fidelidade_ate,
        },
      ];
    });
  }

  async acronymTaken(acronym: string): Promise<boolean> {
    const club = await this.prisma.clubes.findUnique({
      where: { sigla: acronym },
      select: { id: true },
    });
    return club !== null;
  }
}

function toClub(row: ClubRow): Club {
  return Club.reconstitute({
    id: row.id,
    name: row.nome,
    acronym: row.sigla.trim(),
    cash: Money.roundHalfAwayFromZero(row.caixa.toString()),
  });
}

type SquadRow = {
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

function toSquadPlayer(row: SquadRow): Player {
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

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
