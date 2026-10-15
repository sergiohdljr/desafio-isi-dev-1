import { describe, expect, it } from "vitest"
import { pageRange } from "@/features/players/utils/page-range"

describe("pageRange", () => {
  it("retorna zero sem itens", () => {
    expect(pageRange(1, 10, 0)).toEqual({ start: 0, end: 0 })
  })

  it("calcula o intervalo da página", () => {
    expect(pageRange(1, 10, 25)).toEqual({ start: 1, end: 10 })
    expect(pageRange(3, 10, 25)).toEqual({ start: 21, end: 25 })
  })
})
