import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SellPlayerDialog } from "@/features/players/components/sell-player-dialog"
import type { Sale } from "@/features/players/types/market.types"
import { makeSquadPlayer } from "@/test/fixtures"

vi.mock("@/features/players/api/players.api", () => ({
  sellPlayer: vi.fn(),
}))

import { sellPlayer } from "@/features/players/api/players.api"

const sellPlayerMock = vi.mocked(sellPlayer)

function saleFixture(): Sale {
  return {
    id: 2,
    type: "VENDA",
    club_id: 10,
    player_id: 1,
    player_name: "Davi Melo",
    value: 1_100_000,
    fee: 10_000,
    cash_change: 900_000,
    club_cash: 5_900_000,
    penalty: 100_000,
    profit: 100_000,
    purchase_value: 1_000_000,
    remaining_days: 50,
    penalty_rate: 20,
    contract_status: "RESCINDIDO",
  }
}

describe("SellPlayerDialog", () => {
  beforeEach(() => {
    sellPlayerMock.mockReset()
  })

  it("avisa quando o jogador é titular", () => {
    const player = makeSquadPlayer({ name: "Davi Melo" })
    render(
      <SellPlayerDialog
        player={player}
        clubName="Clube Aurora"
        starter
        onClose={vi.fn()}
        onSold={vi.fn()}
        onViewHistory={vi.fn()}
      />,
    )
    const dialog = screen.getByRole("dialog", { name: "Vender Davi Melo?" })
    expect(within(dialog).getByText("Davi Melo é titular")).toBeInTheDocument()
  })

  it("confirma venda e mostra sucesso", async () => {
    const user = userEvent.setup()
    const player = makeSquadPlayer({ id: 1, name: "Davi Melo" })
    const onSold = vi.fn().mockResolvedValue(undefined)
    sellPlayerMock.mockResolvedValue(saleFixture())

    render(
      <SellPlayerDialog
        player={player}
        clubName="Clube Aurora"
        starter
        onClose={vi.fn()}
        onSold={onSold}
        onViewHistory={vi.fn()}
      />,
    )
    const dialog = screen.getByRole("dialog", { name: "Vender Davi Melo?" })
    await user.click(within(dialog).getByRole("button", { name: /Confirmar venda/i }))

    expect(sellPlayerMock).toHaveBeenCalledWith(1)
    expect(onSold).toHaveBeenCalled()
    expect(await screen.findByRole("heading", { name: "Venda concluída" })).toBeInTheDocument()
    expect(screen.getByText(/saiu da escalação/i)).toBeInTheDocument()
  })

  it("chama onViewHistory após sucesso", async () => {
    const user = userEvent.setup()
    const onViewHistory = vi.fn()
    sellPlayerMock.mockResolvedValue(saleFixture())

    render(
      <SellPlayerDialog
        player={makeSquadPlayer()}
        clubName="Clube Aurora"
        starter={false}
        onClose={vi.fn()}
        onSold={vi.fn().mockResolvedValue(undefined)}
        onViewHistory={onViewHistory}
      />,
    )

    await user.click(screen.getByRole("button", { name: /Confirmar venda/i }))
    await screen.findByRole("heading", { name: "Venda concluída" })
    await user.click(screen.getByRole("button", { name: /Ver histórico/i }))
    expect(onViewHistory).toHaveBeenCalledOnce()
  })
})
