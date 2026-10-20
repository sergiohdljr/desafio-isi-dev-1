import { describe, expect, it } from "vitest"
import { duelCaption } from "@/features/league/utils/duel-caption"

describe("duelCaption", () => {
  it("descreve o atacante pela ordem da linha", () => {
    expect(duelCaption(1, "attacker", "ATA", "Delta FC")).toBe("ATA, 4º de linha · Delta FC")
    expect(duelCaption(2, "attacker", "MEI", "Delta FC")).toBe("MEI, 3º de linha · Delta FC")
    expect(duelCaption(6, "attacker", "LAT", "Águias FC")).toBe("LAT, 2º de linha · Águias FC")
  })

  it("chama o primeiro defensor de goleiro", () => {
    expect(duelCaption(1, "defender", "GOL", "Águias FC")).toBe("Goleiro · Águias FC")
    expect(duelCaption(4, "defender", "GOL", "Delta FC")).toBe("Goleiro · Delta FC")
  })

  it("numera a linha do defensor nos duelos seguintes", () => {
    expect(duelCaption(2, "defender", "ZAG", "Águias FC")).toBe("ZAG, 1º de linha · Águias FC")
    expect(duelCaption(3, "defender", "LAT", "Águias FC")).toBe("LAT, 2º de linha · Águias FC")
  })
})
