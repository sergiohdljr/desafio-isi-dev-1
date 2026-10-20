import { beforeEach, describe, expect, it, vi } from "vitest"
import { makeClub } from "@/test/fixtures"

vi.mock("@/features/clubs/api/clubs.api", () => ({
  getLineup: vi.fn(),
}))

import { getLineup } from "@/features/clubs/api/clubs.api"
import { matchSides } from "@/features/league/utils/match-sides"

const getLineupMock = vi.mocked(getLineup)

describe("matchSides", () => {
  beforeEach(() => {
    getLineupMock.mockReset()
  })

  it("monta mandante e visitante com o nome do clube", async () => {
    getLineupMock.mockImplementation(async (id) => ({
      club_id: id,
      formation: id === 1 ? null : "2-1-1",
      complete: id !== 1,
      players: [],
    }))

    await expect(
      matchSides("1", "2", [makeClub({ id: 1, name: "Clube Casa" }), makeClub({ id: 2, name: "Clube Fora" })]),
    ).resolves.toEqual([
      { id: "1", name: "Clube Casa", complete: false },
      { id: "2", name: "Clube Fora", complete: true },
    ])
  })

  it("trata falha na consulta como escalação incompleta", async () => {
    getLineupMock.mockRejectedValue(new Error("falha"))

    await expect(matchSides("1", "2", [])).resolves.toEqual([
      { id: "1", name: undefined, complete: false },
      { id: "2", name: undefined, complete: false },
    ])
  })
})
