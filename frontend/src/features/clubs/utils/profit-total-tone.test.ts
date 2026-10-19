import { describe, expect, it } from "vitest"
import { profitTotalTone } from "@/features/clubs/utils/profit-total-tone"

describe("profitTotalTone", () => {
  it("uses success when total profit is positive", () => {
    expect(profitTotalTone("total_profit", 3)).toBe("text-success")
  })

  it("uses destructive when total profit is negative", () => {
    expect(profitTotalTone("total_profit", -2.7)).toBe("text-destructive")
  })

  it("leaves zero profit uncolored", () => {
    expect(profitTotalTone("total_profit", 0)).toBe("")
  })

  it("leaves the other totals uncolored", () => {
    expect(profitTotalTone("total_spent", -10)).toBe("")
    expect(profitTotalTone("total_received", 10)).toBe("")
    expect(profitTotalTone("total_fees", 1)).toBe("")
    expect(profitTotalTone("total_penalties", 1)).toBe("")
  })
})
