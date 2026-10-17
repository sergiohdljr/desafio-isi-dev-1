import { type Player } from '../../../players/domain/entities/player.js';
import {
  type Condition,
  type Position,
} from '../../../players/domain/types/player-types.js';
import { type Formation } from '../../domain/formation.js';
import { type MatchPlan, type SideFacts } from '../../domain/play-match.js';
import { type StandingMatch } from '../../domain/standings.js';

export const LEAGUE_REPOSITORY = Symbol('LEAGUE_REPOSITORY');

export type ClubLineup = {
  formation: Formation | null;
  players: Player[];
};

export type LineupCandidate = {
  clubId: number | null;
  condition: Condition;
  position: Position;
};

export type SavedMatch = MatchPlan & {
  id: number;
  playedAt: Date;
};

export type MatchSummary = Omit<SavedMatch, 'duels'>;

export interface LeagueRepository {
  findLineup(clubId: number): Promise<ClubLineup | null>;
  replaceLineup(
    clubId: number,
    formation: Formation,
    playerIds: number[],
    settle: (facts: { clubFound: boolean; players: LineupCandidate[] }) => void,
  ): Promise<void>;
  play(
    homeClubId: number,
    awayClubId: number,
    playedAt: Date,
    settle: (facts: { home: SideFacts; away: SideFacts }) => MatchPlan,
  ): Promise<SavedMatch>;
  listMatches(clubId?: number): Promise<MatchSummary[]>;
  findMatch(id: number): Promise<SavedMatch | null>;
  standingsSource(): Promise<StandingMatch[]>;
}
