import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CreateClubDialog } from "@/features/clubs/components/create-club-dialog"

describe("CreateClubDialog", () => {
  it("rejeita nome inválido", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CreateClubDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo clube" })

    await user.type(within(dialog).getByRole("textbox", { name: /^Nome/ }), "X")
    await user.type(within(dialog).getByRole("textbox", { name: /^Sigla/ }), "XXX")
    await user.click(within(dialog).getByRole("button", { name: "Criar clube" }))

    expect(within(dialog).getByText("Não foi possível criar o clube")).toBeInTheDocument()
    expect(within(dialog).getByText("Nome inválido")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("rejeita sigla inválida", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CreateClubDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo clube" })

    await user.type(within(dialog).getByRole("textbox", { name: /^Nome/ }), "Clube Aurora")
    await user.type(within(dialog).getByRole("textbox", { name: /^Sigla/ }), "XXX")
    await user.click(within(dialog).getByRole("button", { name: "Criar clube" }))

    expect(within(dialog).getByText("Sigla inválida")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("envia draft válido", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CreateClubDialog onClose={vi.fn()} onSubmit={onSubmit} />)
    const dialog = screen.getByRole("dialog", { name: "Novo clube" })

    await user.type(within(dialog).getByRole("textbox", { name: /^Nome/ }), "Clube Aurora")
    await user.type(within(dialog).getByRole("textbox", { name: /^Sigla/ }), "CAU")
    await user.click(within(dialog).getByRole("button", { name: "Criar clube" }))

    expect(onSubmit).toHaveBeenCalledWith({ name: "Clube Aurora", acronym: "CAU" })
  })
})
