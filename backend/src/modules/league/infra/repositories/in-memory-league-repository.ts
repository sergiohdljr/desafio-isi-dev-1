import { type Formation } from '../../domain/formation.js';
import { type MatchPlan, type SideFacts } from '../../domain/play-match.js';
import { type StandingMatch } from '../../domain/standings.js';
import {
  type ClubLineup,
  type LeagueRepository,
  type LineupCandidate,
  type MatchSummary,
  type SavedMatch,
} from '../../application/repositories/league-repository.js';

export class InMemoryLeagueRepository implements LeagueRepository {
  private nextId: number;

  constructor(private readonly matches: SavedMatch[] = []) {
    this.nextId = matches.reduce((max, match) => Math.max(max, match.id), 0) + 1;
  }

  async findLineup(): Promise<ClubLineup | null> {
    return null;
  }

  async replaceLineup(
    _clubId: number,
    _formation: Formation,
    _playerIds: number[],
    settle: (facts: { clubFound: boolean; players: LineupCandidate[] }) => void,
  ): Promise<void> {
    settle({ clubFound: false, players: [] });
  }

  async play(
    homeClubId: number,
    awayClubId: number,
    playedAt: Date,
    settle: (facts: { home: SideFacts; away: SideFacts }) => MatchPlan,
  ): Promise<SavedMatch> {
    const empty: SideFacts = { club: null, formation: null, players: [] };
    const plan = settle({ home: empty, away: empty });
    const saved: SavedMatch = {
      ...plan,
      id: this.nextId,
      playedAt,
      homeClubId,
      awayClubId,
    };
    this.nextId += 1;
    this.matches.push(saved);
    return saved;
  }

  async listMatches(clubId?: number): Promise<MatchSummary[]> {
    const rows =
      clubId === undefined
        ? this.matches
        : this.matches.filter(
            (match) =>
              match.homeClubId === clubId || match.awayClubId === clubId,
          );
    return rows.map(({ duels: _duels, ...summary }) => summary);
  }

  async findMatch(id: number): Promise<SavedMatch | null> {
    return this.matches.find((match) => match.id === id) ?? null;
  }

  async standingsSource(): Promise<StandingMatch[]> {
    return this.matches.map((match) => ({
      homeClubId: match.homeClubId,
      awayClubId: match.awayClubId,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
    }));
  }
}
