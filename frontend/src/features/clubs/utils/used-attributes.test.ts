import { describe, expect, it } from "vitest"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { usedAttributes } from "@/features/clubs/utils/used-attributes"

function player(position: SquadPlayer["position"]): SquadPlayer {
  return {
    id: 1,
    name: "Jogador",
    position,
    condition: "APTO",
    age: 25,
    agility: 50,
    pace: 50,
    shooting: 80,
    passing: 70,
    dribbling: 60,
    defending: 55,
    physical: 50,
    overall: 60,
    potential: 70,
    base_value: 10,
    market_value: 10,
    club_id: 1,
    contract: { purchase_value: 10, loyalty_until: "2027-01-01T12:00-03:00", remaining_days: 100 },
  }
}

describe("usedAttributes", () => {
  it("formata por posição", () => {
    expect(usedAttributes(player("ATA"))).toBe("Finalização 80")
    expect(usedAttributes(player("MEI"))).toBe("Passe 70")
    expect(usedAttributes(player("LAT"))).toBe("Drible 60 Defesa 55")
    expect(usedAttributes(player("ZAG"))).toBe("Defesa 55")
  })
})
