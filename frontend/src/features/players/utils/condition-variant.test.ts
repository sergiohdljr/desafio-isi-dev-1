import { describe, expect, it } from "vitest"
import { conditionVariant } from "@/features/players/utils/condition-variant"

describe("conditionVariant", () => {
  it("mapeia condição para variant do badge", () => {
    expect(conditionVariant("APTO")).toBe("success")
    expect(conditionVariant("MAL_CONDICIONADO")).toBe("warning")
    expect(conditionVariant("DOENTE")).toBe("destructive")
  })
})
