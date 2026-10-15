import { describe, expect, it } from "vitest"
import { signedCoins } from "@/features/players/utils/signed-coins"

describe("signedCoins", () => {
  it("formata com sinal", () => {
    expect(signedCoins(10)).toBe("+10,00")
    expect(signedCoins(-10)).toBe("−10,00")
    expect(signedCoins(0)).toBe("0,00")
  })
})
