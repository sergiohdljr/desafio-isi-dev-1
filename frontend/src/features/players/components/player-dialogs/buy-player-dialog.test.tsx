import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BuyPlayerDialog } from "@/features/players/components/player-dialogs/buy-player-dialog"
import { ApiError } from "@/lib/http"
import { makeClub, makePlayer } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"
import type { Purchase } from "@/features/players/types/market.types"
import { clubOption } from "@/features/players/utils/club-option"

function purchaseFixture(clubId: number): Purchase {
  return {
    id: 1,
    type: "COMPRA",
    club_id: clubId,
    player_id: 1,
    player_name: "Davi Melo",
    value: 1_200_000,
    fee: 60_000,
    cash_change: -1_260_000,
    club_cash: 3_740_000,
    created_at: "2026-01-01T12:00:00.000Z",
    contract: {
      purchase_value: 1_200_000,
      loyalty_until: "2027-01-01T12:00:00.000-03:00",
      status: "ATIVO",
    },
  }
}

describe("BuyPlayerDialog", () => {
  it("exige clube, data e hora", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithProviders(
      <BuyPlayerDialog player={makePlayer()} clubs={[makeClub()]} onClose={vi.fn()} onSubmit={onSubmit} />,
    )
    const dialog = screen.getByRole("dialog", { name: "Comprar jogador" })

    await user.click(within(dialog).getByRole("button", { name: /Confirmar compra/i }))
    expect(within(dialog).getByText("Escolha o clube, a data e a hora da fidelidade.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("mostra Compra concluída após sucesso", async () => {
    const user = userEvent.setup()
    const club = makeClub({ id: 10, name: "Clube Aurora" })
    const onSubmit = vi.fn().mockResolvedValue(purchaseFixture(club.id))
    renderWithProviders(
      <BuyPlayerDialog player={makePlayer()} clubs={[club]} onClose={vi.fn()} onSubmit={onSubmit} />,
    )
    const dialog = screen.getByRole("dialog", { name: "Comprar jogador" })

    await user.click(within(dialog).getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: clubOption(club) }))
    await user.type(within(dialog).getByLabelText("Data da fidelidade"), "2027-06-01")
    await user.type(within(dialog).getByLabelText("Hora da fidelidade"), "15:30")
    await user.click(within(dialog).getByRole("button", { name: /Confirmar compra/i }))

    expect(onSubmit).toHaveBeenCalledWith(10, "2027-06-01T15:30-03:00")
    expect(await screen.findByRole("heading", { name: "Compra concluída" })).toBeInTheDocument()
  })

  it("mostra Sem conexão e Tentar de novo em erro de rede", async () => {
    const user = userEvent.setup()
    const club = makeClub()
    const onSubmit = vi.fn().mockRejectedValue(new ApiError("falha", 0))
    renderWithProviders(
      <BuyPlayerDialog player={makePlayer()} clubs={[club]} onClose={vi.fn()} onSubmit={onSubmit} />,
    )
    const dialog = screen.getByRole("dialog", { name: "Comprar jogador" })

    await user.click(within(dialog).getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: clubOption(club) }))
    await user.type(within(dialog).getByLabelText("Data da fidelidade"), "2027-06-01")
    await user.type(within(dialog).getByLabelText("Hora da fidelidade"), "15:30")
    await user.click(within(dialog).getByRole("button", { name: /Confirmar compra/i }))

    expect(await within(dialog).findByText("Sem conexão")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: /Tentar de novo/i })).toBeInTheDocument()
  })
})
