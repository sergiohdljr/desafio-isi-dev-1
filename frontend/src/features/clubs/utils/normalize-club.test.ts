import { describe, expect, it } from "vitest"
import { foldAccents, normalizeAcronym, normalizeClubName } from "@/features/clubs/utils/normalize-club"

describe("normalizeClubName", () => {
  it("corta e colapsa espaços", () => {
    expect(normalizeClubName("  Real   Madrid  ")).toBe("Real Madrid")
  })
})

describe("normalizeAcronym", () => {
  it("corta espaços e deixa maiúsculo", () => {
    expect(normalizeAcronym("  abc  ")).toBe("ABC")
  })
})

describe("foldAccents", () => {
  it("remove diacríticos", () => {
    expect(foldAccents("São Paulo")).toBe("Sao Paulo")
    expect(foldAccents("Águia")).toBe("Aguia")
  })
})
