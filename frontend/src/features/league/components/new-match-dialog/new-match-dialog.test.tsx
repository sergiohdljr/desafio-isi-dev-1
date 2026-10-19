import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NewMatchDialog } from "@/features/league/components/new-match-dialog/new-match-dialog"
import type { Match } from "@/features/league/types/match.types"
import { makeClub } from "@/test/fixtures"

vi.mock("@/features/league/api/league.api", () => ({
  playMatch: vi.fn(),
}))

vi.mock("@/features/clubs/api/clubs.api", () => ({
  getLineup: vi.fn(),
}))

import { getLineup } from "@/features/clubs/api/clubs.api"
import { playMatch } from "@/features/league/api/league.api"

const playMatchMock = vi.mocked(playMatch)
const getLineupMock = vi.mocked(getLineup)

const home = makeClub({ id: 1, name: "Clube Casa", acronym: "CAS" })
const away = makeClub({ id: 2, name: "Clube Fora", acronym: "FOR" })

function matchFixture(): Match {
  return {
    id: 99,
    played_at: "2026-01-01T12:00:00.000Z",
    home: { club_id: 1, club_name: "Clube Casa", formation: "2-1-1", goals: 2 },
    away: { club_id: 2, club_name: "Clube Fora", formation: "2-1-1", goals: 1 },
    result: "MANDANTE",
    duels: [],
  }
}

describe("NewMatchDialog", () => {
  beforeEach(() => {
    playMatchMock.mockReset()
  })

  it("exige dois clubes diferentes", async () => {
    const user = userEvent.setup()
    const onPlayed = vi.fn()
    render(<NewMatchDialog clubs={[home, away]} onClose={vi.fn()} onPlayed={onPlayed} />)
    const dialog = screen.getByRole("dialog", { name: "Nova partida" })

    await user.click(within(dialog).getByRole("combobox", { name: "Mandante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(within(dialog).getByText("Escolha dois clubes diferentes.")).toBeInTheDocument()
    expect(playMatchMock).not.toHaveBeenCalled()
    expect(onPlayed).not.toHaveBeenCalled()
  })

  it("marca só o mandante quando a escalação dele está incompleta", async () => {
    const user = userEvent.setup()
    playMatchMock.mockRejectedValue(new Error("Escalação incompleta"))
    getLineupMock.mockImplementation(async (id) => ({
      club_id: id,
      formation: id === 1 ? null : "2-1-1",
      complete: id !== 1,
      players: [],
    }))
    render(<NewMatchDialog clubs={[home, away]} onClose={vi.fn()} onPlayed={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Nova partida" })

    await user.click(within(dialog).getByRole("combobox", { name: "Mandante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Fora/ }))
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(await within(dialog).findByText("Não foi possível jogar a partida")).toBeInTheDocument()
    expect(within(dialog).getByText("Escalação incompleta: o Clube Casa não tem os 5 titulares.")).toBeInTheDocument()
    expect(within(dialog).getByRole("combobox", { name: "Mandante" })).toHaveAttribute("aria-invalid", "true")
    expect(within(dialog).getByRole("combobox", { name: "Visitante" })).not.toHaveAttribute("aria-invalid")
  })

  it("marca os dois clubes quando as duas escalações estão incompletas", async () => {
    const user = userEvent.setup()
    playMatchMock.mockRejectedValue(new Error("Escalação incompleta"))
    getLineupMock.mockResolvedValue({ club_id: 0, formation: null, complete: false, players: [] })
    render(<NewMatchDialog clubs={[home, away]} onClose={vi.fn()} onPlayed={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Nova partida" })

    await user.click(within(dialog).getByRole("combobox", { name: "Mandante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Fora/ }))
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(
      await within(dialog).findByText("Escalação incompleta: o Clube Casa e o Clube Fora não têm os 5 titulares."),
    ).toBeInTheDocument()
    expect(within(dialog).getByRole("combobox", { name: "Mandante" })).toHaveAttribute("aria-invalid", "true")
    expect(within(dialog).getByRole("combobox", { name: "Visitante" })).toHaveAttribute("aria-invalid", "true")
  })

  it("chama onPlayed após sucesso", async () => {
    const user = userEvent.setup()
    const onPlayed = vi.fn()
    const match = matchFixture()
    playMatchMock.mockResolvedValue(match)
    render(<NewMatchDialog clubs={[home, away]} onClose={vi.fn()} onPlayed={onPlayed} />)
    const dialog = screen.getByRole("dialog", { name: "Nova partida" })

    await user.click(within(dialog).getByRole("combobox", { name: "Mandante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    expect(within(dialog).getByRole("combobox", { name: "Mandante" })).toHaveTextContent("Clube Casa (CAS)")
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Fora/ }))
    expect(within(dialog).getByRole("combobox", { name: "Visitante" })).toHaveTextContent("Clube Fora (FOR)")
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(playMatchMock).toHaveBeenCalledWith(1, 2)
    expect(onPlayed).toHaveBeenCalledWith(match)
  })
})
