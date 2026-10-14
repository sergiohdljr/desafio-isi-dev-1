import { compareNames } from '../../../shared/domain/name-order.js';

export type StandingClub = {
  id: number;
  name: string;
};

export type StandingMatch = {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
};

export type StandingRow = {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type Tally = Omit<StandingRow, 'position'>;

export function rankStandings(
  clubs: StandingClub[],
  matches: StandingMatch[],
): StandingRow[] {
  const table = new Map<number, Tally>();
  for (const club of clubs) {
    table.set(club.id, emptyTally(club));
  }

  for (const match of matches) {
    const home = table.get(match.homeClubId);
    const away = table.get(match.awayClubId);
    if (!home || !away) {
      continue;
    }
    apply(home, match.homeGoals, match.awayGoals);
    apply(away, match.awayGoals, match.homeGoals);
  }

  return [...table.values()]
    .sort(byTable)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

function emptyTally(club: StandingClub): Tally {
  return {
    clubId: club.id,
    clubName: club.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function apply(row: Tally, scored: number, conceded: number): void {
  row.played += 1;
  row.goalsFor += scored;
  row.goalsAgainst += conceded;
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  if (scored > conceded) {
    row.wins += 1;
    row.points += 3;
  } else if (scored === conceded) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}

function byTable(left: Tally, right: Tally): number {
  if (right.points !== left.points) {
    return right.points - left.points;
  }
  if (right.goalDifference !== left.goalDifference) {
    return right.goalDifference - left.goalDifference;
  }
  if (right.goalsFor !== left.goalsFor) {
    return right.goalsFor - left.goalsFor;
  }
  const byName = compareNames(left.clubName, right.clubName);
  if (byName !== 0) {
    return byName;
  }
  return left.clubId - right.clubId;
}
