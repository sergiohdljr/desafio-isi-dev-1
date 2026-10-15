import { describe, expect, it } from "vitest"
import { capitalizePt } from "@/features/clubs/utils/capitalize-pt"

describe("capitalizePt", () => {
  it("uppercases the first letter with pt-BR rules", () => {
    expect(capitalizePt("nome")).toBe("Nome")
    expect(capitalizePt("patrimônio (maior para o menor)")).toBe("Patrimônio (maior para o menor)")
  })

  it("returns empty strings unchanged", () => {
    expect(capitalizePt("")).toBe("")
  })
})
