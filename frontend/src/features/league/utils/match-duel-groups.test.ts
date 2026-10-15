import { describe, expect, it } from "vitest"
import type { Match } from "@/features/league/types/match.types"
import { matchDuelGroups } from "@/features/league/utils/match-duel-groups"

const match: Match = {
  id: 1,
  played_at: "2026-01-01T12:00:00-03:00",
  result: "MANDANTE",
  home: { club_id: 1, club_name: "Casa", formation: "2-1-1", goals: 2 },
  away: { club_id: 2, club_name: "Fora", formation: "2-1-1", goals: 0 },
  duels: [
    {
      order: 1,
      attacking_club_id: 1,
      goal: true,
      attacker: {
        player_id: 1,
        player_name: "A",
        position: "ATA",
        condition: "APTO",
        attribute: "shooting",
        value: 80,
      },
      defender: {
        player_id: 2,
        player_name: "B",
        position: "GOL",
        condition: "APTO",
        attribute: "defending",
        value: 40,
      },
    },
    {
      order: 4,
      attacking_club_id: 2,
      goal: false,
      attacker: {
        player_id: 3,
        player_name: "C",
        position: "ATA",
        condition: "APTO",
        attribute: "shooting",
        value: 50,
      },
      defender: {
        player_id: 4,
        player_name: "D",
        position: "GOL",
        condition: "APTO",
        attribute: "defending",
        value: 70,
      },
    },
  ],
}

describe("matchDuelGroups", () => {
  it("agrupa ataques por clube", () => {
    const groups = matchDuelGroups(match, (id) => (id === 1 ? "CSA" : "FRA"))
    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ acronym: "CSA", goals: 1, duels: [match.duels[0]] })
    expect(groups[1]).toMatchObject({ acronym: "FRA", goals: 0, duels: [match.duels[1]] })
    expect(groups[0].title).toContain("mandante")
    expect(groups[1].title).toContain("visitante")
  })
})
