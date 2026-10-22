import { describe, expect, it } from "vitest"
import type { Player } from "@/features/players/types/player.types"
import { attributeLine, fits, placeOnPitch } from "@/features/league/utils/pitch-slot"

function player(partial: Partial<Player> & Pick<Player, "position">): Player {
  return {
    id: 1,
    name: "Jogador",
    condition: "APTO",
    age: 25,
    agility: 50,
    pace: 50,
    shooting: 70,
    passing: 65,
    dribbling: 60,
    defending: 55,
    physical: 50,
    overall: 60,
    potential: 70,
    base_value: 10,
    market_value: 10,
    club_id: 1,
    ...partial,
  }
}

describe("fits", () => {
  it("encaixa DEF com ZAG ou LAT", () => {
    expect(fits("DEF", "ZAG")).toBe(true)
    expect(fits("DEF", "LAT")).toBe(true)
    expect(fits("DEF", "MEI")).toBe(false)
  })

  it("encaixa posição exata", () => {
    expect(fits("ATA", "ATA")).toBe(true)
    expect(fits("ATA", "MEI")).toBe(false)
  })
})

describe("placeOnPitch", () => {
  const lineup = [
    player({ id: 1, name: "Lateral", position: "LAT" }),
    player({ id: 2, name: "Goleiro", position: "GOL" }),
    player({ id: 3, name: "Atacante", position: "ATA" }),
    player({ id: 4, name: "Zagueiro", position: "ZAG" }),
    player({ id: 5, name: "Meia", position: "MEI" }),
  ]

  it("coloca cada linha da formação no eixo certo e o zagueiro acima do lateral", () => {
    const placed = placeOnPitch("2-1-1", lineup, "home")
    expect(placed.map((mark) => [mark.player.position, mark.top, mark.left])).toEqual([
      ["GOL", "50%", "6.5%"],
      ["ZAG", "32.3%", "17.9%"],
      ["LAT", "67.7%", "17.9%"],
      ["MEI", "50%", "28.8%"],
      ["ATA", "50%", "39%"],
    ])
  })

  it("espelha o visitante e leva o ataque das formações sem meio até a última linha", () => {
    const attack = placeOnPitch(
      "3-1",
      lineup.filter((item) => item.position !== "MEI"),
      "away",
    )
    expect(attack.map((mark) => [mark.player.position, mark.left])).toEqual([
      ["GOL", "93.5%"],
      ["ZAG", "82.1%"],
      ["LAT", "82.1%"],
      ["ATA", "61%"],
    ])
  })
})

describe("attributeLine", () => {
  it("formata o atributo por posição", () => {
    expect(attributeLine(player({ position: "ATA", shooting: 80 }))).toBe("Fin 80")
    expect(attributeLine(player({ position: "MEI", passing: 72 }))).toBe("Pas 72")
    expect(attributeLine(player({ position: "LAT", dribbling: 61, defending: 50 }))).toBe("Dri 61 · Def 50")
    expect(attributeLine(player({ position: "ZAG", defending: 77 }))).toBe("Def 77")
    expect(attributeLine(player({ position: "GOL", defending: 40 }))).toBe("Def 40")
  })
})
