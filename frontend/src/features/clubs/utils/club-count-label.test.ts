import { describe, expect, it } from "vitest"
import { clubCountLabel } from "@/features/clubs/utils/club-count-label"

describe("clubCountLabel", () => {
  it("uses the singular for one club", () => {
    expect(clubCountLabel(1)).toBe("1 clube")
  })

  it("uses the plural for zero and many clubs", () => {
    expect(clubCountLabel(0)).toBe("0 clubes")
    expect(clubCountLabel(3)).toBe("3 clubes")
  })
})
