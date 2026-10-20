import { describe, expect, it } from "vitest"
import { incompleteClubs } from "@/features/league/utils/incomplete-clubs"

describe("incompleteClubs", () => {
  it("fica só com o lado incompleto", () => {
    expect(
      incompleteClubs([
        { id: "1", name: "Clube Casa", complete: false },
        { id: "2", name: "Clube Fora", complete: true },
      ]),
    ).toEqual({ ids: ["1"], names: ["Clube Casa"] })
  })

  it("mantém os dois lados incompletos na ordem", () => {
    expect(
      incompleteClubs([
        { id: "1", name: "Clube Casa", complete: false },
        { id: "2", name: "Clube Fora", complete: false },
      ]),
    ).toEqual({ ids: ["1", "2"], names: ["Clube Casa", "Clube Fora"] })
  })

  it("ignora lado incompleto sem nome", () => {
    expect(incompleteClubs([{ id: "1", complete: false }])).toEqual({ ids: ["1"], names: [] })
  })
})
