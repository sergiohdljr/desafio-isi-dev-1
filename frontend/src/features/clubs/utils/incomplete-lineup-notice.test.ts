import { describe, expect, it } from "vitest"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { incompleteLineupNotice } from "@/features/clubs/utils/incomplete-lineup-notice"

function squadPlayer(partial: Partial<SquadPlayer> & Pick<SquadPlayer, "id" | "name" | "position" | "condition">): SquadPlayer {
  return {
    age: 25,
    agility: 50,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    overall: 50,
    potential: 60,
    base_value: 10,
    market_value: 10,
    club_id: 1,
    contract: { purchase_value: 10, loyalty_until: "2027-01-01T12:00-03:00", remaining_days: 100 },
    ...partial,
  }
}

describe("incompleteLineupNotice", () => {
  it("retorna null quando completa", () => {
    expect(
      incompleteLineupNotice({
        clubName: "Casa",
        formation: "2-1-1",
        savedCount: 5,
        squad: [],
        sales: [],
      }),
    ).toBeNull()
  })

  it("monta aviso com venda", () => {
    const notice = incompleteLineupNotice({
      clubName: "Casa",
      formation: "2-1-1",
      savedCount: 4,
      squad: [squadPlayer({ id: 1, name: "A", position: "GOL", condition: "APTO" })],
      sales: [{ player_id: 9, player_name: "Vendido", type: "VENDA", created_at: "2026-01-02T12:00:00-03:00" }],
    })
    expect(notice?.title).toContain("Casa")
    expect(notice?.description).toContain("Vendido")
  })
})
