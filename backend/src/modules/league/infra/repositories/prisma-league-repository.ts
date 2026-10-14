import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { Player } from '../../../players/domain/entities/player.js';
import {
  type Condition,
  type Position,
} from '../../../players/domain/types/player-types.js';
import { Money } from '../../../../shared/domain/money.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { type Formation } from '../../domain/formation.js';
import {
  matchResult,
  type DuelPlan,
  type MatchPlan,
  type SideFacts,
} from '../../domain/play-match.js';
import {
  type ClubLineup,
  type LeagueRepository,
  type LineupCandidate,
  type MatchSummary,
  type SavedMatch,
} from '../../application/repositories/league-repository.js';
import {
  formationFromDb,
  formationToDb,
  optionalFormationFromDb,
} from '../formation-record.js';

type Tx = Prisma.TransactionClient;

const matchInclude = {
  mandante: { select: { nome: true } },
  visitante: { select: { nome: true } },
  duelos: { orderBy: { ordem: 'asc' as const } },
} satisfies Prisma.partidasInclude;

@Injectable()
export class PrismaLeagueRepository implements LeagueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLineup(clubId: number): Promise<ClubLineup | null> {
    const club = await this.prisma.clubes.findUnique({
      where: { id: clubId },
      select: { id: true, formacao: true },
    });
    if (!club) {
      return null;
    }

    return {
      formation: optionalFormationFromDb(club.formacao),
      players: await this.starters(this.prisma, clubId),
    };
  }

  async replaceLineup(
    clubId: number,
    formation: Formation,
    playerIds: number[],
    settle: (facts: { clubFound: boolean; players: LineupCandidate[] }) => void,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
      const club = await tx.clubes.findUnique({
        where: { id: clubId },
        select: { id: true },
      });
      const rows = club
        ? await tx.jogadores.findMany({
            where: { id: { in: playerIds }, excluido_em: null },
          })
        : [];
      settle({
        clubFound: club !== null,
        players: rows.map((row) => ({
          clubId: row.clube_id,
          condition: row.condicao,
          position: row.posicao,
        })),
      });
      if (!club) {
        return;
      }

      await tx.escalacoes.deleteMany({
        where: {
          OR: [{ clube_id: clubId }, { jogador_id: { in: playerIds } }],
        },
      });
      await tx.clubes.update({
        where: { id: clubId },
        data: { formacao: formationToDb(formation) },
      });
      await tx.escalacoes.createMany({
        data: playerIds.map((playerId) => ({
          clube_id: clubId,
          jogador_id: playerId,
        })),
      });
    });
  }

  async play(
    homeClubId: number,
    awayClubId: number,
    playedAt: Date,
    settle: (facts: { home: SideFacts; away: SideFacts }) => MatchPlan,
  ): Promise<SavedMatch> {
    return this.prisma.$transaction(async (tx) => {
      const [first, second] =
        homeClubId < awayClubId
          ? [homeClubId, awayClubId]
          : [awayClubId, homeClubId];
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${first} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${second} FOR UPDATE`;

      const plan = settle({
        home: await this.sideFacts(tx, homeClubId),
        away: await this.sideFacts(tx, awayClubId),
      });
      const created = await tx.partidas.create({
        data: {
          mandante_id: plan.homeClubId,
          visitante_id: plan.awayClubId,
          gols_mandante: plan.homeGoals,
          gols_visitante: plan.awayGoals,
          formacao_mandante: formationToDb(plan.homeFormation),
          formacao_visitante: formationToDb(plan.awayFormation),
          jogada_em: playedAt,
          duelos: { create: plan.duels.map(duelRow) },
        },
        include: matchInclude,
      });
      return toSavedMatch(created);
    });
  }

  async listMatches(clubId?: number): Promise<{
    missingClub: boolean;
    matches: MatchSummary[];
  }> {
    if (clubId !== undefined) {
      const club = await this.prisma.clubes.findUnique({
        where: { id: clubId },
        select: { id: true },
      });
      if (!club) {
        return { missingClub: true, matches: [] };
      }
    }

    const rows = await this.prisma.partidas.findMany({
      where:
        clubId === undefined
          ? {}
          : { OR: [{ mandante_id: clubId }, { visitante_id: clubId }] },
      orderBy: [{ jogada_em: 'desc' }, { id: 'desc' }],
      include: {
        mandante: { select: { nome: true } },
        visitante: { select: { nome: true } },
      },
    });

    return {
      missingClub: false,
      matches: rows.map((row) => {
        const { duels: _duels, ...summary } = toSavedMatch({
          ...row,
          duelos: [],
        });
        return summary;
      }),
    };
  }

  async findMatch(id: number): Promise<SavedMatch | null> {
    const row = await this.prisma.partidas.findUnique({
      where: { id },
      include: matchInclude,
    });
    return row ? toSavedMatch(row) : null;
  }

  async standingsSource(): Promise<{
    clubs: { id: number; name: string }[];
    matches: {
      homeClubId: number;
      awayClubId: number;
      homeGoals: number;
      awayGoals: number;
    }[];
  }> {
    const clubs = await this.prisma.clubes.findMany({
      select: { id: true, nome: true },
    });
    const matches = await this.prisma.partidas.findMany({
      select: {
        mandante_id: true,
        visitante_id: true,
        gols_mandante: true,
        gols_visitante: true,
      },
    });
    return {
      clubs: clubs.map((club) => ({ id: club.id, name: club.nome })),
      matches: matches.map((match) => ({
        homeClubId: match.mandante_id,
        awayClubId: match.visitante_id,
        homeGoals: match.gols_mandante,
        awayGoals: match.gols_visitante,
      })),
    };
  }

  private async sideFacts(tx: Tx, clubId: number): Promise<SideFacts> {
    const club = await tx.clubes.findUnique({
      where: { id: clubId },
      select: { id: true, nome: true, formacao: true },
    });
    if (!club) {
      return { club: null, formation: null, players: [] };
    }

    const players = await this.starters(tx, clubId);
    return {
      club: { id: club.id, name: club.nome },
      formation: optionalFormationFromDb(club.formacao),
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        position: player.position,
        condition: player.condition,
        clubId: player.clubId,
        shooting: player.shooting,
        passing: player.passing,
        dribbling: player.dribbling,
        defending: player.defending,
      })),
    };
  }

  private async starters(
    tx: Tx | PrismaService,
    clubId: number,
  ): Promise<Player[]> {
    const seats = await tx.escalacoes.findMany({
      where: {
        clube_id: clubId,
        jogador: {
          clube_id: clubId,
          excluido_em: null,
          condicao: { not: 'DOENTE' },
        },
      },
      include: { jogador: true },
    });
    return seats.map((seat) => toPlayer(seat.jogador));
  }
}

function duelRow(duel: DuelPlan) {
  return {
    ordem: duel.order,
    clube_atacante_id: duel.attackingClubId,
    atacante_id: duel.attacker.playerId,
    defensor_id: duel.defender.playerId,
    nome_atacante: duel.attacker.playerName,
    nome_defensor: duel.defender.playerName,
    posicao_atacante: duel.attacker.position,
    posicao_defensor: duel.defender.position,
    condicao_atacante: duel.attacker.condition,
    condicao_defensor: duel.defender.condition,
    atributo_ataque: duel.attacker.attribute,
    atributo_defesa: duel.defender.attribute,
    valor_ataque: duel.attacker.value,
    valor_defesa: duel.defender.value,
    gol: duel.goal,
  };
}

type MatchRow = Prisma.partidasGetPayload<{ include: typeof matchInclude }>;

function toSavedMatch(row: MatchRow): SavedMatch {
  return {
    id: row.id,
    playedAt: row.jogada_em,
    homeClubId: row.mandante_id,
    awayClubId: row.visitante_id,
    homeName: row.mandante.nome,
    awayName: row.visitante.nome,
    homeFormation: formationFromDb(row.formacao_mandante),
    awayFormation: formationFromDb(row.formacao_visitante),
    homeGoals: row.gols_mandante,
    awayGoals: row.gols_visitante,
    result: matchResult(row.gols_mandante, row.gols_visitante),
    duels: row.duelos.map((duel) => ({
      order: duel.ordem,
      attackingClubId: duel.clube_atacante_id,
      attacker: {
        playerId: duel.atacante_id,
        playerName: duel.nome_atacante,
        position: duel.posicao_atacante,
        condition: duel.condicao_atacante,
        attribute: duel.atributo_ataque,
        value: duel.valor_ataque,
      },
      defender: {
        playerId: duel.defensor_id,
        playerName: duel.nome_defensor,
        position: duel.posicao_defensor,
        condition: duel.condicao_defensor,
        attribute: duel.atributo_defesa,
        value: duel.valor_defesa,
      },
      goal: duel.gol,
    })),
  };
}

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
