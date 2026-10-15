import { describe, expect, it } from "vitest"
import { formatLoyalty, splitLoyalty } from "@/features/players/utils/format-loyalty"

describe("formatLoyalty", () => {
  it("formata data e hora", () => {
    expect(formatLoyalty("2026-03-15T18:30-03:00")).toBe("15/03/2026, 18:30")
    expect(formatLoyalty("2026-03-15 18:30")).toBe("15/03/2026, 18:30")
  })

  it("repassa valor inválido", () => {
    expect(formatLoyalty("indefinido")).toBe("indefinido")
  })
})

describe("splitLoyalty", () => {
  it("separa data e hora", () => {
    expect(splitLoyalty("2026-03-15T18:30-03:00")).toEqual({ date: "15/03/2026", time: "18:30" })
  })
})
