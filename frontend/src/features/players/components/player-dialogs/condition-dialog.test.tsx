import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ConditionDialog } from "@/features/players/components/player-dialogs/condition-dialog"
import { makePlayer } from "@/test/fixtures"

describe("ConditionDialog", () => {
  it("bloqueia Apto quando o jogador está Doente", () => {
    const player = makePlayer({ condition: "DOENTE" })
    render(<ConditionDialog player={player} onClose={vi.fn()} onSubmit={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Alterar condição física" })

    expect(within(dialog).getByText("De Doente não passa direto para Apto.")).toBeInTheDocument()
    expect(within(dialog).getByRole("radio", { name: /Apto/ })).toHaveAttribute("aria-disabled", "true")
  })

  it("salva Mal condicionado", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const player = makePlayer({ condition: "APTO" })
    render(<ConditionDialog player={player} onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Alterar condição física" })

    await user.click(within(dialog).getByRole("radio", { name: /Mal condicionado/ }))
    await user.click(within(dialog).getByRole("button", { name: "Salvar condição" }))

    expect(onSubmit).toHaveBeenCalledWith("MAL_CONDICIONADO")
  })

  it("avisa quando titular passa a Doente", async () => {
    const user = userEvent.setup()
    const player = makePlayer({ name: "Davi Melo", condition: "APTO" })
    render(<ConditionDialog player={player} starterClub="Clube Aurora" onClose={vi.fn()} onSubmit={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Alterar condição física" })

    await user.click(within(dialog).getByRole("radio", { name: /Doente/ }))
    expect(within(dialog).getByText("Davi Melo é titular")).toBeInTheDocument()
    expect(within(dialog).getByText(/sai da escalação/i)).toBeInTheDocument()
  })
})
