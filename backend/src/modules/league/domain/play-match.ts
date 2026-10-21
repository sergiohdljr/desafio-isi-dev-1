import { arrangeSquad } from '../../clubs/domain/entities/squad.js';
import { DomainError } from '../../../shared/domain/domain-error.js';
import {
  type Condition,
  type Position,
} from '../../players/domain/types/player-types.js';
import { type Formation, lineupFits } from './formation.js';

export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

export type FieldCondition = 'APTO' | 'MAL_CONDICIONADO';

export type SidePlayer = {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  clubId: number | null;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
};

export type SideFacts = {
  club: { id: number; name: string } | null;
  formation: Formation | null;
  players: SidePlayer[];
};

type DuelSide = {
  playerId: number;
  playerName: string;
  position: Position;
  condition: FieldCondition;
  attribute: DuelAttribute;
  value: number;
};

export type DuelPlan = {
  order: number;
  attackingClubId: number;
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
};

export type MatchPlan = {
  homeClubId: number;
  awayClubId: number;
  homeName: string;
  awayName: string;
  homeFormation: Formation;
  awayFormation: Formation;
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
  duels: DuelPlan[];
};

const pairings = [
  { attacker: 4, defender: 0 },
  { attacker: 3, defender: 1 },
  { attacker: 2, defender: 2 },
] as const;

export function matchResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) {
    return 'MANDANTE';
  }
  if (awayGoals > homeGoals) {
    return 'VISITANTE';
  }
  return 'EMPATE';
}

export function duelValue(raw: number, condition: FieldCondition): number {
  if (condition === 'APTO') {
    return raw;
  }
  return Math.floor((raw * 85 + 50) / 100);
}

function attackAttribute(
  position: Position,
): Exclude<DuelAttribute, 'defending'> {
  if (position === 'ATA') {
    return 'shooting';
  }
  if (position === 'MEI') {
    return 'passing';
  }
  return 'dribbling';
}

export function decideMatch(facts: {
  home: SideFacts;
  away: SideFacts;
}): MatchPlan {
  if (!facts.home.club || !facts.away.club) {
    throw new DomainError('missing', 'Clube não encontrado');
  }

  const home = readySide(facts.home);
  const away = readySide(facts.away);
  if (!home || !away) {
    throw new DomainError('conflict', 'Escalação incompleta');
  }

  const duels = [...attackWave(home, away, 1), ...attackWave(away, home, 4)];
  const homeGoals = duels.filter((duel) => duel.order <= 3 && duel.goal).length;
  const awayGoals = duels.filter((duel) => duel.order >= 4 && duel.goal).length;

  return {
    homeClubId: home.club.id,
    awayClubId: away.club.id,
    homeName: home.club.name,
    awayName: away.club.name,
    homeFormation: home.formation,
    awayFormation: away.formation,
    homeGoals,
    awayGoals,
    result: matchResult(homeGoals, awayGoals),
    duels,
  };
}

type ReadySide = {
  club: { id: number; name: string };
  formation: Formation;
  players: Array<SidePlayer & { condition: FieldCondition }>;
};

function readySide(side: SideFacts): ReadySide | null {
  if (!side.club || !side.formation) {
    return null;
  }

  const eligible = side.players.filter(
    (player) =>
      player.clubId === side.club?.id && player.condition !== 'DOENTE',
  );
  if (
    eligible.length !== 5 ||
    !lineupFits(
      side.formation,
      eligible.map((player) => player.position),
    )
  ) {
    return null;
  }

  const ordered = arrangeSquad(eligible);
  if (ordered[0]?.position !== 'GOL') {
    return null;
  }

  return {
    club: side.club,
    formation: side.formation,
    players: ordered.map((player) => ({
      ...player,
      condition:
        player.condition === 'MAL_CONDICIONADO' ? 'MAL_CONDICIONADO' : 'APTO',
    })),
  };
}

function attackWave(
  attacking: ReadySide,
  defending: ReadySide,
  firstOrder: number,
): DuelPlan[] {
  return pairings.map((pairing, index) => {
    const attacker = attacking.players[pairing.attacker];
    const defender = defending.players[pairing.defender];
    if (!attacker || !defender) {
      throw new DomainError('conflict', 'Escalação incompleta');
    }
    const attack = duelSide(attacker, attackAttribute(attacker.position));
    const defense = duelSide(defender, 'defending');
    return {
      order: firstOrder + index,
      attackingClubId: attacking.club.id,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value,
    };
  });
}

function duelSide(
  player: SidePlayer & { condition: FieldCondition },
  attribute: DuelAttribute,
): DuelSide {
  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    condition: player.condition,
    attribute,
    value: duelValue(player[attribute], player.condition),
  };
}
