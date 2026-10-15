import { describe, expect, it } from "vitest"
import { resultLabel, resultVariant } from "@/features/league/utils/match-result-display"

describe("resultLabel", () => {
  it("traduz o resultado", () => {
    expect(resultLabel("MANDANTE")).toBe("Vitória do mandante")
    expect(resultLabel("VISITANTE")).toBe("Vitória do visitante")
    expect(resultLabel("EMPATE")).toBe("Empate")
  })
})

describe("resultVariant", () => {
  it("usa secondary só no empate", () => {
    expect(resultVariant("EMPATE")).toBe("secondary")
    expect(resultVariant("MANDANTE")).toBe("success")
    expect(resultVariant("VISITANTE")).toBe("success")
  })
})
