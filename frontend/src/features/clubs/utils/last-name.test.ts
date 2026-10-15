import { describe, expect, it } from "vitest"
import { lastName } from "@/features/clubs/utils/last-name"

describe("lastName", () => {
  it("pega o último nome", () => {
    expect(lastName("Davi Melo")).toBe("Melo")
    expect(lastName("Pelé")).toBe("Pelé")
  })
})
