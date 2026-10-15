import { describe, expect, it } from "vitest"
import type { Club } from "@/features/clubs/types/club.types"
import { clubOption } from "@/features/players/utils/club-option"

const club: Club = {
  id: 1,
  name: "Real Madrid",
  acronym: "RMD",
  cash: 300,
  squad_value: 0,
  net_worth: 300,
}

describe("clubOption", () => {
  it("monta rótulo com caixa", () => {
    expect(clubOption(club)).toBe("Real Madrid (RMD) · caixa 300,00")
  })
})
