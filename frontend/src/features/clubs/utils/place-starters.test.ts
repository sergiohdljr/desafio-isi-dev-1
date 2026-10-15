import { describe, expect, it } from "vitest"
import type { Player } from "@/features/players/types/player.types"
import { emptyStarters, placeStarters } from "@/features/clubs/utils/place-starters"

function player(id: number, position: Player["position"]): Player {
  return {
    id,
    name: `P${id}`,
    position,
    condition: "APTO",
    age: 25,
    agility: 50,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    overall: 50,
    potential: 60,
    base_value: 10,
    market_value: 10,
    club_id: 1,
  }
}

describe("emptyStarters", () => {
  it("cria 5 vagas vazias", () => {
    expect(emptyStarters()).toEqual([null, null, null, null, null])
  })
})

describe("placeStarters", () => {
  it("preenche as vagas da formação", () => {
    const ids = placeStarters("2-1-1", [
      player(1, "GOL"),
      player(2, "ZAG"),
      player(3, "LAT"),
      player(4, "MEI"),
      player(5, "ATA"),
    ])
    expect(ids).toEqual([1, 2, 3, 4, 5])
  })
})
