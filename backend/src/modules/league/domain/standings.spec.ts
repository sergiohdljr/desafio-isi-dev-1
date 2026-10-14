import { rankStandings } from './standings.js';

describe('standings', () => {
  it('ranks every club by points, goal difference, goals scored and name', () => {
    const rows = rankStandings(
      [
        { id: 1, name: 'Águias FC' },
        { id: 2, name: 'Delta FC' },
        { id: 3, name: 'Gama SC' },
        { id: 4, name: 'Épsilon EC' },
        { id: 5, name: 'Tubarões EC' },
        { id: 6, name: 'Mangue FC' },
      ],
      [
        { homeClubId: 1, awayClubId: 2, homeGoals: 1, awayGoals: 2 },
        { homeClubId: 3, awayClubId: 4, homeGoals: 2, awayGoals: 1 },
        { homeClubId: 4, awayClubId: 1, homeGoals: 3, awayGoals: 2 },
        { homeClubId: 2, awayClubId: 3, homeGoals: 0, awayGoals: 1 },
      ],
    );

    expect(
      rows.map((row) => [
        row.position,
        row.clubName,
        row.points,
        row.goalDifference,
        row.goalsFor,
      ]),
    ).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
    expect(rows[5]).toMatchObject({
      played: 2,
      wins: 0,
      draws: 0,
      losses: 2,
      goalsAgainst: 5,
    });
  });
});
