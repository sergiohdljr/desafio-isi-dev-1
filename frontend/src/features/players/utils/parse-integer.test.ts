import { describe, expect, it } from "vitest"
import { parseInteger } from "@/features/players/utils/parse-integer"

describe("parseInteger", () => {
  it("aceita só dígitos", () => {
    expect(parseInteger("42")).toBe(42)
    expect(parseInteger("0")).toBe(0)
  })

  it("rejeita inválidos", () => {
    expect(parseInteger("")).toBeNull()
    expect(parseInteger("4.2")).toBeNull()
    expect(parseInteger("-1")).toBeNull()
    expect(parseInteger("1e2")).toBeNull()
  })
})
