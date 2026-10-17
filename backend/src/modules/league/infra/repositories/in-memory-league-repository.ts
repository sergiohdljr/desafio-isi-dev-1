import { Money } from '../../../../shared/domain/money.js';
import { Player } from '../../../players/domain/entities/player.js';
import {
  type Condition,
  type Position,
} from '../../../players/domain/types/player-types.js';
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

export type MemoryLeagueClub = {
  id: number;
  name: string;
};

export type MemoryLeaguePlayer = {
  id: number;
  name: string;
  clubId: number | null;
  condition: Condition;
  position: Position;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
};

type StoredLineup = {
  formation: Formation;
  playerIds: number[];
};

export class InMemoryLeagueRepository implements LeagueRepository {
  private nextId: number;
  private readonly lineups = new Map<number, StoredLineup>();

  constructor(
    private readonly matches: SavedMatch[] = [],
    private readonly clubs: MemoryLeagueClub[] = [],
    private readonly players: MemoryLeaguePlayer[] = [],
  ) {
    this.nextId =
      matches.reduce((max, match) => Math.max(max, match.id), 0) + 1;
  }

  async findLineup(clubId: number): Promise<ClubLineup | null> {
    const club = this.clubs.find((item) => item.id === clubId);
    if (!club) {
      return null;
    }
    const lineup = this.lineups.get(clubId);
    return {
      formation: lineup?.formation ?? null,
      players: (lineup?.playerIds ?? [])
        .map((id) => this.player(id))
        .filter((player): player is Player => player !== null),
    };
  }

  async replaceLineup(
    clubId: number,
    formation: Formation,
    playerIds: number[],
    settle: (facts: { clubFound: boolean; players: LineupCandidate[] }) => void,
  ): Promise<void> {
    const club = this.clubs.find((item) => item.id === clubId);
    const selected = playerIds
      .map((id) => this.players.find((player) => player.id === id))
      .filter((player): player is MemoryLeaguePlayer => player !== undefined);
    settle({
      clubFound: club !== undefined,
      players: selected.map((player) => ({
        clubId: player.clubId,
        condition: player.condition,
        position: player.position,
      })),
    });
    if (!club) {
      return;
    }
    this.lineups.set(clubId, { formation, playerIds });
  }

  async play(
    homeClubId: number,
    awayClubId: number,
    playedAt: Date,
    settle: (facts: { home: SideFacts; away: SideFacts }) => MatchPlan,
  ): Promise<SavedMatch> {
    const plan = settle({
      home: this.side(homeClubId),
      away: this.side(awayClubId),
    });
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

  private side(clubId: number): SideFacts {
    const club = this.clubs.find((item) => item.id === clubId);
    if (!club) {
      return { club: null, formation: null, players: [] };
    }
    const lineup = this.lineups.get(clubId);
    const players = (lineup?.playerIds ?? [])
      .map((id) => this.players.find((player) => player.id === id))
      .filter((player): player is MemoryLeaguePlayer => player !== undefined);
    return {
      club: { id: club.id, name: club.name },
      formation: lineup?.formation ?? null,
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

  private player(id: number): Player | null {
    const row = this.players.find((player) => player.id === id);
    if (!row) {
      return null;
    }
    return Player.reconstitute({
      id: row.id,
      name: row.name,
      position: row.position,
      agility: 50,
      age: 25,
      condition: row.condition,
      baseValue: Money.fromCents(100),
      pace: 50,
      shooting: row.shooting,
      passing: row.passing,
      dribbling: row.dribbling,
      defending: row.defending,
      physical: 50,
      potential: 50,
      clubId: row.clubId,
      excluded: false,
    });
  }
}
