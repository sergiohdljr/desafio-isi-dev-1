import { describe, expect, it } from "vitest"
import { attributeFill } from "@/features/players/utils/attribute-fill"

describe("attributeFill", () => {
  it("converte para percentual da escala", () => {
    expect(attributeFill(null)).toBe(0)
    expect(attributeFill(0)).toBe(0)
    expect(attributeFill(99)).toBe(100)
    expect(attributeFill(49.5)).toBeCloseTo(50)
  })
})
