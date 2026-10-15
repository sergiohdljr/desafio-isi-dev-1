import { describe, expect, it } from "vitest"
import { penaltyRateFor } from "@/features/clubs/utils/penalty-rate"

describe("penaltyRateFor", () => {
  it("retorna 0 sem dias restantes", () => {
    expect(penaltyRateFor(0)).toBe(0)
    expect(penaltyRateFor(-1)).toBe(0)
  })

  it("retorna 5 até 30 dias", () => {
    expect(penaltyRateFor(1)).toBe(5)
    expect(penaltyRateFor(11)).toBe(5)
    expect(penaltyRateFor(30)).toBe(5)
  })

  it("retorna 10 até 180 dias", () => {
    expect(penaltyRateFor(31)).toBe(10)
    expect(penaltyRateFor(180)).toBe(10)
  })

  it("retorna 20 acima de 180 dias", () => {
    expect(penaltyRateFor(181)).toBe(20)
    expect(penaltyRateFor(200)).toBe(20)
  })
})
