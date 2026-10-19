import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NewMatchDialog } from "@/features/league/components/new-match-dialog/new-match-dialog"
import type { Match } from "@/features/league/types/match.types"
import { makeClub } from "@/test/fixtures"

vi.mock("@/features/league/api/league.api", () => ({
  playMatch: vi.fn(),
}))

import { playMatch } from "@/features/league/api/league.api"

const playMatchMock = vi.mocked(playMatch)

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

  it("mostra Escalação incompleta quando a API menciona escalação", async () => {
    const user = userEvent.setup()
    playMatchMock.mockRejectedValue(new Error("Escalação incompleta no clube mandante"))
    render(<NewMatchDialog clubs={[home, away]} onClose={vi.fn()} onPlayed={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Nova partida" })

    await user.click(within(dialog).getByRole("combobox", { name: "Mandante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Casa/ }))
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Fora/ }))
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(await within(dialog).findByText("Escalação incompleta")).toBeInTheDocument()
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
    await user.click(within(dialog).getByRole("combobox", { name: "Visitante" }))
    await user.click(await screen.findByRole("option", { name: /Clube Fora/ }))
    await user.click(within(dialog).getByRole("button", { name: /Jogar partida/i }))

    expect(playMatchMock).toHaveBeenCalledWith(1, 2)
    expect(onPlayed).toHaveBeenCalledWith(match)
  })
})
