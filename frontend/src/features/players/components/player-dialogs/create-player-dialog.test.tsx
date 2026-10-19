import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CreatePlayerDialog } from "@/features/players/components/player-dialogs/create-player-dialog"

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) {
  await user.type(within(dialog).getByPlaceholderText("Davi Melo"), "Davi Melo")
  await user.click(within(dialog).getByRole("radio", { name: /ATA|Atacante/ }))
  await user.type(within(dialog).getByRole("textbox", { name: /^Idade/ }), "24")
  await user.type(within(dialog).getByRole("textbox", { name: /^Agilidade/ }), "70")
  for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
    await user.type(within(dialog).getByLabelText(label, { exact: true }), "60")
  }
  await user.type(within(dialog).getByLabelText(/Potencial/), "80")
}

describe("CreatePlayerDialog", () => {
  it("valida idade e nome no submit vazio/inválido", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CreatePlayerDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo jogador" })

    await user.type(within(dialog).getByPlaceholderText("Davi Melo"), "Ab")
    await user.click(within(dialog).getByRole("radio", { name: /ATA|Atacante/ }))
    await user.type(within(dialog).getByRole("textbox", { name: /^Idade/ }), "15")
    await user.type(within(dialog).getByRole("textbox", { name: /^Agilidade/ }), "70")
    for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
      await user.type(within(dialog).getByLabelText(label, { exact: true }), "60")
    }
    await user.type(within(dialog).getByLabelText(/Potencial/), "80")
    await user.click(within(dialog).getByRole("button", { name: "Salvar jogador" }))

    expect(within(dialog).getByText("De 16 a 45 anos.")).toBeInTheDocument()
    expect(within(dialog).getByText(/duas palavras|sem números|3 a 100/i)).toBeInTheDocument()
    expect(within(dialog).getByText("Corrija os campos destacados para salvar.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("exige posição", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CreatePlayerDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo jogador" })

    await user.type(within(dialog).getByPlaceholderText("Davi Melo"), "Davi Melo")
    await user.type(within(dialog).getByRole("textbox", { name: /^Idade/ }), "24")
    await user.type(within(dialog).getByRole("textbox", { name: /^Agilidade/ }), "70")
    for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
      await user.type(within(dialog).getByLabelText(label, { exact: true }), "60")
    }
    await user.type(within(dialog).getByLabelText(/Potencial/), "80")
    await user.click(within(dialog).getByRole("button", { name: "Salvar jogador" }))

    expect(within(dialog).getByText("Escolha uma posição.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("rejeita soma de indicadores acima de 480", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CreatePlayerDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo jogador" })

    await user.type(within(dialog).getByPlaceholderText("Davi Melo"), "Davi Melo")
    await user.click(within(dialog).getByRole("radio", { name: /ATA|Atacante/ }))
    await user.type(within(dialog).getByRole("textbox", { name: /^Idade/ }), "24")
    await user.type(within(dialog).getByRole("textbox", { name: /^Agilidade/ }), "70")
    for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
      await user.type(within(dialog).getByLabelText(label, { exact: true }), "90")
    }
    await user.type(within(dialog).getByLabelText(/Potencial/), "95")
    await user.click(within(dialog).getByRole("button", { name: "Salvar jogador" }))

    expect(within(dialog).getByText("A soma dos indicadores não pode passar de 480.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("chama onSubmit com payload válido e cancela com onClose", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CreatePlayerDialog onClose={onClose} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo jogador" })

    await fillValidForm(user, dialog)
    await user.click(within(dialog).getByRole("button", { name: "Salvar jogador" }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Davi Melo",
      position: "ATA",
      age: 24,
      agility: 70,
      pace: 60,
      shooting: 60,
      passing: 60,
      dribbling: 60,
      defending: 60,
      physical: 60,
      potential: 80,
    })

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }))
    expect(onClose).toHaveBeenCalled()
  })
})
