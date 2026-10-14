import { presentPlayer } from '../../../../players/infra/http/presenters/player-response.js';
import { formatBrasilia } from '../../../../clubs/infra/http/presenters/brasilia-time.js';
import { type LineupView } from '../../../application/use-cases/lineup.use-case.js';
import {
  type MatchSummary,
  type SavedMatch,
} from '../../../application/repositories/league-repository.js';
import { type DuelPlan } from '../../../domain/play-match.js';
import { type StandingRow } from '../../../domain/standings.js';

export function presentLineup(view: LineupView) {
  return {
    club_id: view.clubId,
    formation: view.formation,
    complete: view.complete,
    players: view.players.map(presentPlayer),
  };
}

export function presentMatchSummary(match: MatchSummary) {
  return {
    id: match.id,
    played_at: formatBrasilia(match.playedAt),
    home: side(match, 'home'),
    away: side(match, 'away'),
    result: match.result,
  };
}

export function presentMatch(match: SavedMatch) {
  return {
    ...presentMatchSummary(match),
    duels: match.duels.map(presentDuel),
  };
}

export function presentStanding(row: StandingRow) {
  return {
    position: row.position,
    club_id: row.clubId,
    club_name: row.clubName,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goals_for: row.goalsFor,
    goals_against: row.goalsAgainst,
    goal_difference: row.goalDifference,
    points: row.points,
  };
}

function side(match: MatchSummary, which: 'home' | 'away') {
  if (which === 'home') {
    return {
      club_id: match.homeClubId,
      club_name: match.homeName,
      formation: match.homeFormation,
      goals: match.homeGoals,
    };
  }
  return {
    club_id: match.awayClubId,
    club_name: match.awayName,
    formation: match.awayFormation,
    goals: match.awayGoals,
  };
}

function presentDuel(duel: DuelPlan) {
  return {
    order: duel.order,
    attacking_club_id: duel.attackingClubId,
    attacker: presentDuelSide(duel.attacker),
    defender: presentDuelSide(duel.defender),
    goal: duel.goal,
  };
}

function presentDuelSide(player: DuelPlan['attacker']) {
  return {
    player_id: player.playerId,
    player_name: player.playerName,
    position: player.position,
    condition: player.condition,
    attribute: player.attribute,
    value: player.value,
  };
}
