import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { EditPlayerDialog } from "@/features/players/components/player-dialogs/edit-player-dialog"
import { makePlayer } from "@/test/fixtures"

describe("EditPlayerDialog", () => {
  it("impede diminuir a idade", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const player = makePlayer({ age: 24 })
    render(<EditPlayerDialog player={player} onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Editar jogador" })

    const age = within(dialog).getByRole("textbox", { name: /^Idade/ })
    await user.clear(age)
    await user.type(age, "20")
    await user.click(within(dialog).getByRole("button", { name: "Salvar alterações" }))

    expect(within(dialog).getByText(/sem diminuir/i)).toBeInTheDocument()
    expect(within(dialog).getByText("Corrija os campos destacados para salvar.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("trava posição quando o jogador tem clube", () => {
    const player = makePlayer({ position: "ATA", club_id: 7 })
    render(<EditPlayerDialog player={player} onClose={vi.fn()} onSubmit={vi.fn()} />)
    const dialog = screen.getByRole("dialog", { name: "Editar jogador" })

    expect(within(dialog).getByRole("radio", { name: /MEI|Meio-campo/ })).toBeDisabled()
    expect(within(dialog).getByText(/Jogador com clube não muda de posição/i)).toBeInTheDocument()
  })

  it("salva alterações válidas", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const player = makePlayer({ name: "Davi Melo", age: 24, agility: 70, position: "ATA", club_id: null })
    render(<EditPlayerDialog player={player} onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Editar jogador" })

    const age = within(dialog).getByRole("textbox", { name: /^Idade/ })
    await user.clear(age)
    await user.type(age, "25")
    await user.click(within(dialog).getByRole("button", { name: "Salvar alterações" }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Davi Melo",
      position: "ATA",
      age: 25,
      agility: 70,
    })
  })
})
