import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LineupBoard } from "@/features/clubs/components/lineup-board/lineup-board"
import type { Lineup } from "@/features/clubs/types/lineup.types"
import { makeSquadPlayer } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"

vi.mock("@/features/clubs/api/clubs.api", () => ({
  getLineup: vi.fn(),
  listClubTransactions: vi.fn(),
  saveLineup: vi.fn(),
}))

import { getLineup, listClubTransactions, saveLineup } from "@/features/clubs/api/clubs.api"

const getLineupMock = vi.mocked(getLineup)
const listClubTransactionsMock = vi.mocked(listClubTransactions)
const saveLineupMock = vi.mocked(saveLineup)

const clubId = 10
const clubName = "Clube Aurora"

function squadFor211() {
  return [
    makeSquadPlayer({ id: 1, name: "Goleiro Um", position: "GOL" }),
    makeSquadPlayer({ id: 2, name: "Zagueiro Dois", position: "ZAG" }),
    makeSquadPlayer({ id: 3, name: "Lateral Tres", position: "LAT" }),
    makeSquadPlayer({ id: 4, name: "Meia Quatro", position: "MEI" }),
    makeSquadPlayer({ id: 5, name: "Atacante Cinco", position: "ATA" }),
  ]
}

function lineupFromSquad(players = squadFor211()): Lineup {
  return {
    club_id: clubId,
    formation: "2-1-1",
    complete: players.length === 5,
    players,
  }
}

describe("LineupBoard", () => {
  beforeEach(() => {
    getLineupMock.mockReset()
    listClubTransactionsMock.mockReset()
    saveLineupMock.mockReset()
    listClubTransactionsMock.mockResolvedValue({
      data: [],
      summary: {
        total_spent: 0,
        total_received: 0,
        total_fees: 0,
        total_penalties: 0,
        total_profit: 0,
      },
    })
  })

  it("mostra incompleta e desabilita salvar", async () => {
    getLineupMock.mockResolvedValue({
      club_id: clubId,
      formation: null,
      complete: false,
      players: [],
    })
    const squad = squadFor211().slice(0, 2)
    renderWithProviders(<LineupBoard clubId={clubId} clubName={clubName} squad={squad} />)

    expect(await screen.findByText(`Escalação incompleta: o ${clubName} não pode jogar partidas`)).toBeInTheDocument()
    expect(screen.getByText("Incompleta")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Salvar escalação/i })).toBeDisabled()
  })

  it("mostra Completa quando a escalação está preenchida", async () => {
    const squad = squadFor211()
    getLineupMock.mockResolvedValue(lineupFromSquad(squad))
    renderWithProviders(<LineupBoard clubId={clubId} clubName={clubName} squad={squad} />)

    expect(await screen.findByText("Completa")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Salvar escalação/i })).toBeEnabled()
  })

  it("recusa escalar jogador DOENTE", async () => {
    const user = userEvent.setup()
    const sick = makeSquadPlayer({ id: 9, name: "Doente Nove", position: "GOL", condition: "DOENTE" })
    const squad = [sick, ...squadFor211().slice(1)]
    getLineupMock.mockResolvedValue({
      club_id: clubId,
      formation: null,
      complete: false,
      players: [],
    })
    renderWithProviders(<LineupBoard clubId={clubId} clubName={clubName} squad={squad} />)

    await screen.findByText("Incompleta")
    await user.click(screen.getByRole("combobox", { name: "Goleiro" }))
    await user.click(await screen.findByRole("option", { name: /Doente Nove/ }))

    expect(screen.getByText("A escalação foi recusada")).toBeInTheDocument()
    expect(screen.getByText("Doente Nove está DOENTE e não pode ser escalado.")).toBeInTheDocument()
  })

  it("salva escalação e mostra toast", async () => {
    const user = userEvent.setup()
    const squad = squadFor211()
    const stored = lineupFromSquad(squad)
    getLineupMock.mockResolvedValue(stored)
    saveLineupMock.mockResolvedValue(stored)
    renderWithProviders(<LineupBoard clubId={clubId} clubName={clubName} squad={squad} />)

    await screen.findByText("Completa")
    await user.click(screen.getByRole("button", { name: /Salvar escalação/i }))

    await waitFor(() => {
      expect(saveLineupMock).toHaveBeenCalledWith(
        clubId,
        "2-1-1",
        squad.map((player) => player.id),
      )
    })
    expect(await screen.findByText("Escalação salva")).toBeInTheDocument()
    expect(screen.getByText(`${clubName} está escalado na formação 2-1-1.`)).toBeInTheDocument()
  })
})
