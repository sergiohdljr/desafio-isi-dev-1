import { describe, expect, it } from "vitest"
import type { DirectoryQuery, Player } from "@/features/players/types/player.types"
import { arrangePlayers, cents, comparePlayers } from "@/features/players/utils/arrange-players"

function player(partial: Partial<Player> & Pick<Player, "id" | "name">): Player {
  return {
    position: "MEI",
    agility: 50,
    age: 25,
    condition: "APTO",
    base_value: 20,
    market_value: 30,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 70,
    overall: 60,
    club_id: null,
    ...partial,
  }
}

function query(partial: Partial<DirectoryQuery> = {}): DirectoryQuery {
  return {
    sort: "name",
    scope: "all",
    page: 1,
    limit: 10,
    ...partial,
  }
}

describe("cents", () => {
  it("converte o valor para centavos com arredondamento", () => {
    expect(cents(10.5)).toBe(1050)
    expect(cents(10.555)).toBe(1056)
  })
})

describe("comparePlayers", () => {
  it("usa o critério principal e desempata por nome e id", () => {
    const younger = player({ id: 2, name: "Bruno", age: 20 })
    const older = player({ id: 1, name: "Ana", age: 30 })
    expect(comparePlayers(younger, older, "age_asc")).toBeLessThan(0)
    expect(comparePlayers(older, younger, "age_desc")).toBeLessThan(0)

    const first = player({ id: 1, name: "Ana", market_value: 40 })
    const second = player({ id: 2, name: "Bruno", market_value: 40 })
    expect(comparePlayers(first, second, "value_asc")).toBeLessThan(0)
    expect(comparePlayers(first, second, "name")).toBeLessThan(0)

    const sameNameLeft = player({ id: 1, name: "Ana" })
    const sameNameRight = player({ id: 2, name: "Ana" })
    expect(comparePlayers(sameNameLeft, sameNameRight, "name")).toBe(-1)
  })

  it("ordena por posição usando a ordem do campo", () => {
    const keeper = player({ id: 1, name: "Goleiro", position: "GOL" })
    const forward = player({ id: 2, name: "Atacante", position: "ATA" })
    expect(comparePlayers(keeper, forward, "position")).toBeLessThan(0)
  })
})

describe("arrangePlayers", () => {
  const roster = [
    player({ id: 1, name: "Ana", position: "ATA", age: 22, market_value: 40, club_id: 10 }),
    player({ id: 2, name: "Bruno", position: "MEI", age: 28, market_value: 20, club_id: null }),
    player({ id: 3, name: "Carlos", position: "GOL", age: 34, market_value: 55, club_id: 10, condition: "DOENTE" }),
    player({ id: 4, name: "Diego", position: "ZAG", age: 19, market_value: 15, club_id: 20 }),
  ]

  it("filtra por busca, posição, condição e faixa de idade ou valor", () => {
    expect(arrangePlayers(roster, query({ search: "bru" })).players.map((item) => item.id)).toEqual([2])
    expect(arrangePlayers(roster, query({ position: "GOL" })).players.map((item) => item.id)).toEqual([3])
    expect(arrangePlayers(roster, query({ condition: "DOENTE" })).players.map((item) => item.id)).toEqual([3])
    expect(arrangePlayers(roster, query({ minAge: 30 })).players.map((item) => item.id)).toEqual([3])
    expect(arrangePlayers(roster, query({ maxValue: 20 })).players.map((item) => item.id)).toEqual([2, 4])
  })

  it("combina busca, posição, condição, idade e valor", () => {
    const matched = arrangePlayers(
      roster,
      query({ search: "ana", position: "ATA", condition: "APTO", minAge: 20, maxAge: 25, minValue: 30, maxValue: 50 }),
    )
    expect(matched.players.map((item) => item.id)).toEqual([1])
  })

  it("respeita o escopo e o clube nos resultados e nos contadores", () => {
    const free = arrangePlayers(roster, query({ scope: "free" }))
    expect(free.players.map((item) => item.id)).toEqual([2])
    expect(free.counts).toEqual({ all: 4, free: 1, signed: 3 })

    const club = arrangePlayers(roster, query({ clubId: 10 }))
    expect(club.players.map((item) => item.id)).toEqual([1, 3])
    expect(club.counts).toEqual({ all: 2, free: 1, signed: 2 })
  })

  it("ordena, pagina e calcula o total de páginas", () => {
    const byValue = arrangePlayers(roster, query({ sort: "value_desc", limit: 2, page: 1 }))
    expect(byValue.players.map((item) => item.id)).toEqual([3, 1])
    expect(byValue.totalItems).toBe(4)
    expect(byValue.totalPages).toBe(2)

    const secondPage = arrangePlayers(roster, query({ sort: "value_desc", limit: 2, page: 2 }))
    expect(secondPage.players.map((item) => item.id)).toEqual([2, 4])

    const empty = arrangePlayers([], query())
    expect(empty.totalPages).toBe(0)
    expect(empty.players).toEqual([])
  })

  it("mostra 10 por página e deixa o restante na seguinte", () => {
    const many = Array.from({ length: 11 }, (_, index) =>
      player({ id: index + 1, name: `Jogador ${String.fromCharCode(65 + index)}` }),
    )
    const first = arrangePlayers(many, query({ limit: 10, page: 1 }))
    const second = arrangePlayers(many, query({ limit: 10, page: 2 }))
    expect(first.totalItems).toBe(11)
    expect(first.players).toHaveLength(10)
    expect(second.players.map((item) => item.name)).toEqual(["Jogador K"])
  })
})
