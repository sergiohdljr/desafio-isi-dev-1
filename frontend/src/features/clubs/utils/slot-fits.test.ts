import { describe, expect, it } from "vitest"
import { slotFits } from "@/features/clubs/utils/slot-fits"

describe("slotFits", () => {
  it("encaixa DEF com ZAG ou LAT", () => {
    expect(slotFits("DEF", "ZAG")).toBe(true)
    expect(slotFits("DEF", "LAT")).toBe(true)
    expect(slotFits("DEF", "MEI")).toBe(false)
  })

  it("encaixa posição exata", () => {
    expect(slotFits("GOL", "GOL")).toBe(true)
    expect(slotFits("ATA", "MEI")).toBe(false)
  })
})
