import { describe, expect, it } from "vitest"
import { normalizePlayerName, validatePlayerName } from "@/features/players/utils/validate-player-name"

describe("validatePlayerName", () => {
  it("aceita nome válido", () => {
    expect(validatePlayerName("Davi Melo")).toBeNull()
  })

  it("rejeita inválidos", () => {
    expect(validatePlayerName("Ab")).not.toBeNull()
    expect(validatePlayerName("Unico")).not.toBeNull()
    expect(validatePlayerName("Davi 2 Melo")).not.toBeNull()
  })
})

describe("normalizePlayerName", () => {
  it("corta e colapsa espaços", () => {
    expect(normalizePlayerName("  Davi   Melo  ")).toBe("Davi Melo")
  })
})
