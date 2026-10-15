import { describe, expect, it } from "vitest"
import { formatPlayedAt, splitPlayedAt } from "@/features/league/utils/played-at"

describe("formatPlayedAt", () => {
  it("formata data e hora", () => {
    expect(formatPlayedAt("2026-03-15T18:30-03:00")).toBe("15/03/2026, 18:30")
    expect(formatPlayedAt("2026-03-15 18:30")).toBe("15/03/2026, 18:30")
  })

  it("repassa valor inválido", () => {
    expect(formatPlayedAt("ontem")).toBe("ontem")
  })
})

describe("splitPlayedAt", () => {
  it("separa data e hora", () => {
    expect(splitPlayedAt("2026-03-15T18:30-03:00")).toEqual({ date: "15/03/2026", time: "18:30" })
  })
})
