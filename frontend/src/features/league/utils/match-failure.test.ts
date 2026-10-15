import { describe, expect, it } from "vitest"
import { DIFFERENT_CLUBS_MESSAGE } from "@/features/league/consts/new-match"
import { hasDifferentClubs, matchFailureKind } from "@/features/league/utils/match-failure"

describe("hasDifferentClubs", () => {
  it("exige dois clubes distintos", () => {
    expect(hasDifferentClubs("", "1")).toBe(false)
    expect(hasDifferentClubs("1", "1")).toBe(false)
    expect(hasDifferentClubs("1", "2")).toBe(true)
  })
})

describe("matchFailureKind", () => {
  it("classifica a falha", () => {
    expect(matchFailureKind(null)).toBeNull()
    expect(matchFailureKind(DIFFERENT_CLUBS_MESSAGE)).toBe("selection")
    expect(matchFailureKind("Escalação incompleta no mandante.")).toBe("incomplete")
    expect(matchFailureKind("Clube sem permissão.")).toBe("refused")
  })
})
