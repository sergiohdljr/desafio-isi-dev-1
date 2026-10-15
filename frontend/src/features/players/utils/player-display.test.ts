import { describe, expect, it } from "vitest"
import { agilityTone, conditionLabel, initials, positionLabel } from "@/features/players/utils/player-display"

describe("initials", () => {
  it("junta a primeira letra do nome e do sobrenome", () => {
    expect(initials("lucas ferraz")).toBe("LF")
  })

  it("usa só a inicial quando há um único nome", () => {
    expect(initials("  Lucas  ")).toBe("L")
  })

  it("ignora nomes do meio", () => {
    expect(initials("Ana Maria Souza")).toBe("AS")
  })
})

describe("positionLabel", () => {
  it("traduz a sigla da posição", () => {
    expect(positionLabel("MEI")).toBe("Meio-campo")
  })
})

describe("conditionLabel", () => {
  it("traduz a condição", () => {
    expect(conditionLabel("MAL_CONDICIONADO")).toBe("Mal condicionado")
  })
})

describe("agilityTone", () => {
  it("marca agilidade alta, baixa e intermediária", () => {
    expect(agilityTone(70)).toBe("bg-chart-positive")
    expect(agilityTone(30)).toBe("bg-chart-negative")
    expect(agilityTone(31)).toBe("bg-muted-foreground")
  })
})
