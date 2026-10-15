import { describe, expect, it } from "vitest"
import { compareNames, foldName, normalizeSearch } from "@/features/players/utils/compare-names"

describe("foldName", () => {
  it("remove acentos e deixa minúsculo", () => {
    expect(foldName("Águias FC")).toBe("aguias fc")
    expect(foldName("Ênio")).toBe("enio")
  })
})

describe("normalizeSearch", () => {
  it("corta espaços e normaliza o texto", () => {
    expect(normalizeSearch("  João   Silva  ")).toBe("joao silva")
  })
})

describe("compareNames", () => {
  it("ordena ignorando acento e caixa", () => {
    expect(compareNames("Águia", "beta")).toBe(-1)
    expect(compareNames("beta", "Águia")).toBe(1)
    expect(compareNames("Águia", "aguia")).toBe(0)
  })
})
