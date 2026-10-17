import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { Club, MAX_CLUBS } from '../../domain/entities/club.js';
import { type ClubsRepository } from '../../application/repositories/clubs-repository.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

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

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
