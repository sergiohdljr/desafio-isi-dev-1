import { describe, expect, it } from "vitest"
import { optionalInteger, optionalMoney } from "@/features/players/utils/parse-filter"

describe("optionalInteger", () => {
  it("devolve undefined para vazio, texto ou fora da faixa", () => {
    expect(optionalInteger("  ", 16, 45)).toBeUndefined()
    expect(optionalInteger("18a", 16, 45)).toBeUndefined()
    expect(optionalInteger("15", 16, 45)).toBeUndefined()
    expect(optionalInteger("46", 16, 45)).toBeUndefined()
  })

  it("aceita inteiro dentro da faixa, inclusive os limites", () => {
    expect(optionalInteger(" 16 ", 16, 45)).toBe(16)
    expect(optionalInteger("45", 16, 45)).toBe(45)
  })
})

describe("optionalMoney", () => {
  it("devolve undefined para vazio ou formato inválido", () => {
    expect(optionalMoney(" ")).toBeUndefined()
    expect(optionalMoney("1.234")).toBeUndefined()
    expect(optionalMoney("10,555")).toBeUndefined()
  })

  it("aceita inteiro e até duas casas, com vírgula", () => {
    expect(optionalMoney("10")).toBe(10)
    expect(optionalMoney("10,5")).toBe(10.5)
    expect(optionalMoney("10.55")).toBe(10.55)
  })
})
