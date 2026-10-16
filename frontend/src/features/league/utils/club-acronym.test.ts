import { describe, expect, it } from "vitest"
import type { Club } from "@/features/clubs/types/club.types"
import { clubAcronym } from "@/features/league/utils/club-acronym"

const clubs: Club[] = [{ id: 1, name: "Real Madrid", acronym: "RMD", cash: 0, squad_value: 0, net_worth: 0 }]

describe("clubAcronym", () => {
  it("usa a sigla cadastrada", () => {
    expect(clubAcronym(clubs, 1, "Real Madrid")).toBe("RMD")
  })

  it("gera fallback com as 3 primeiras letras", () => {
    expect(clubAcronym(clubs, 9, "Águia Negra")).toBe("ÁGU")
  })
})
