import { describe, expect, it } from "vitest"
import type { Match } from "@/features/league/types/match.types"
import type { Player } from "@/features/players/types/player.types"
import { blankPlayer, roster, sideAppearsFor } from "@/features/league/utils/match-roster"

const match: Match = {
  id: 1,
  played_at: "2026-01-01T12:00:00-03:00",
  result: "MANDANTE",
  home: { club_id: 1, club_name: "Casa", formation: "2-1-1", goals: 1 },
  away: { club_id: 2, club_name: "Fora", formation: "2-1-1", goals: 0 },
  duels: [
    {
      order: 1,
      attacking_club_id: 1,
      goal: true,
      attacker: {
        player_id: 10,
        player_name: "Atacante",
        position: "ATA",
        condition: "APTO",
        attribute: "shooting",
        value: 88,
      },
      defender: {
        player_id: 20,
        player_name: "Zagueiro",
        position: "ZAG",
        condition: "MAL_CONDICIONADO",
        attribute: "defending",
        value: 70,
      },
    },
  ],
}

const lineup: Player[] = [
  {
    id: 10,
    name: "Atacante",
    position: "ATA",
    condition: "APTO",
    age: 24,
    agility: 60,
    pace: 70,
    shooting: 50,
    passing: 40,
    dribbling: 55,
    defending: 20,
    physical: 50,
    overall: 60,
    potential: 70,
    base_value: 10,
    market_value: 12,
    club_id: 1,
  },
]

describe("sideAppearsFor", () => {
  it("identifica atacante e defensor do clube", () => {
    const duel = match.duels[0]
    expect(sideAppearsFor(duel, duel.attacker, 1)).toBe(true)
    expect(sideAppearsFor(duel, duel.defender, 1)).toBe(false)
    expect(sideAppearsFor(duel, duel.defender, 2)).toBe(true)
  })
})

describe("blankPlayer", () => {
  it("monta jogador mínimo a partir do duelo", () => {
    const player = blankPlayer(match.duels[0].attacker)
    expect(player.id).toBe(10)
    expect(player.name).toBe("Atacante")
    expect(player.position).toBe("ATA")
    expect(player.shooting).toBe(0)
  })
})

describe("roster", () => {
  it("aplica valores do duelo e condição", () => {
    const home = roster(match, 1, lineup)
    expect(home).toHaveLength(1)
    expect(home[0].shooting).toBe(88)
    expect(home[0].condition).toBe("APTO")

    const away = roster(match, 2, [])
    expect(away).toHaveLength(1)
    expect(away[0].id).toBe(20)
    expect(away[0].defending).toBe(70)
    expect(away[0].condition).toBe("MAL_CONDICIONADO")
  })
})
