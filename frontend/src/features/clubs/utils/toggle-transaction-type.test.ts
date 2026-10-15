import { describe, expect, it } from "vitest"
import { toggleTransactionType } from "@/features/clubs/utils/toggle-transaction-type"

describe("toggleTransactionType", () => {
  it("adds a type when checked", () => {
    expect(toggleTransactionType(["COMPRA"], "VENDA", true)).toEqual(["COMPRA", "VENDA"])
  })

  it("keeps the list when the type is already present", () => {
    expect(toggleTransactionType(["COMPRA"], "COMPRA", true)).toEqual(["COMPRA"])
  })

  it("removes a type when unchecked", () => {
    expect(toggleTransactionType(["COMPRA", "VENDA"], "COMPRA", false)).toEqual(["VENDA"])
  })
})
