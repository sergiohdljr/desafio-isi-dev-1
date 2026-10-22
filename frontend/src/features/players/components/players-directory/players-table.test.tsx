import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PlayersTable } from "@/features/players/components/players-directory/players-table"
import { makeClub, makePlayer } from "@/test/fixtures"

describe("PlayersTable", () => {
  const handlers = {
    onDetails: vi.fn(),
    onEdit: vi.fn(),
    onCondition: vi.fn(),
    onBuy: vi.fn(),
    onDelete: vi.fn(),
  }

  it("mostra Comprar para jogador livre e chama onBuy", async () => {
    const user = userEvent.setup()
    const onBuy = vi.fn()
    const player = makePlayer({ club_id: null, name: "Livre Silva" })
    render(<PlayersTable players={[player]} clubs={[]} pending={false} {...handlers} onBuy={onBuy} />)

    expect(screen.getByText("Livre")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Jogador" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Posição" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Comprar/i }))
    expect(onBuy).toHaveBeenCalledWith(player)
  })

  it("mostra sigla e nome do clube quando contratado", () => {
    const club = makeClub({ id: 7, name: "Clube Norte", acronym: "NOR" })
    const player = makePlayer({ club_id: 7, name: "Contratado Souza" })
    render(<PlayersTable players={[player]} clubs={[club]} pending={false} {...handlers} />)

    expect(screen.getByText("NOR")).toBeInTheDocument()
    expect(screen.getByText("Clube Norte")).toBeInTheDocument()
    expect(screen.queryByText("Livre")).not.toBeInTheDocument()
  })

  it("anuncia carregamento quando pending", () => {
    render(<PlayersTable players={[]} clubs={[]} pending {...handlers} />)
    expect(screen.getByText("Carregando jogadores…")).toBeInTheDocument()
  })
})
