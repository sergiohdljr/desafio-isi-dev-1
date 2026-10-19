import { describe, expect, it } from "vitest"
import { incompleteLineupMessage } from "@/features/league/utils/incomplete-lineup-message"

describe("incompleteLineupMessage", () => {
  it("cita o clube quando só um lado está incompleto", () => {
    expect(incompleteLineupMessage(["Gama SC"])).toBe("Escalação incompleta: o Gama SC não tem os 5 titulares.")
  })

  it("cita os dois clubes quando ambos estão incompletos", () => {
    expect(incompleteLineupMessage(["Gama SC", "Águias FC"])).toBe(
      "Escalação incompleta: o Gama SC e o Águias FC não têm os 5 titulares.",
    )
  })

  it("fica genérica sem nomes", () => {
    expect(incompleteLineupMessage([])).toBe("Escalação incompleta.")
  })
})