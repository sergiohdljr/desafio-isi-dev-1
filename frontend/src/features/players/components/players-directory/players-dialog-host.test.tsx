import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PlayersDialogHost } from "@/features/players/components/players-directory/players-dialog-host"
import { makeClub, makePlayer } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"

function mutationsMock(overrides: Record<string, ReturnType<typeof vi.fn>> = {}) {
  return {
    createPlayer: vi.fn().mockResolvedValue(makePlayer({ name: "Davi Melo" })),
    updatePlayer: vi.fn().mockResolvedValue(makePlayer()),
    changeCondition: vi.fn().mockResolvedValue(makePlayer({ condition: "MAL_CONDICIONADO" })),
    deletePlayer: vi.fn().mockResolvedValue(undefined),
    buyPlayer: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

describe("PlayersDialogHost", () => {
  it("não renderiza quando dialog é null", () => {
    const { container } = render(
      <PlayersDialogHost
        dialog={null}
        clubs={[]}
        starterClub={null}
        mutations={mutationsMock() as never}
        onClose={vi.fn()}
        onFinish={vi.fn()}
        onOpen={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("abre create e mostra o resumo após cadastrar", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const created = makePlayer({ name: "Davi Melo" })
    const createPlayer = vi.fn().mockResolvedValue(created)
    render(
      <PlayersDialogHost
        dialog={{ type: "create" }}
        clubs={[]}
        starterClub={null}
        mutations={mutationsMock({ createPlayer }) as never}
        onClose={vi.fn()}
        onFinish={vi.fn()}
        onOpen={onOpen}
      />,
    )

    const dialog = screen.getByRole("dialog", { name: "Novo jogador" })
    await user.type(within(dialog).getByPlaceholderText("Davi Melo"), "Davi Melo")
    await user.click(within(dialog).getByRole("radio", { name: /ATA|Atacante/ }))
    await user.type(within(dialog).getByRole("textbox", { name: /^Idade/ }), "24")
    await user.type(within(dialog).getByRole("textbox", { name: /^Agilidade/ }), "70")
    for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
      await user.type(within(dialog).getByLabelText(label, { exact: true }), "60")
    }
    await user.type(within(dialog).getByLabelText(/Potencial/), "80")
    await user.click(within(dialog).getByRole("button", { name: "Salvar jogador" }))

    expect(createPlayer).toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledWith({ type: "created", player: created })
  })

  it("em details, Editar chama onOpen com edit", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const player = makePlayer({ name: "Davi Melo" })
    render(
      <PlayersDialogHost
        dialog={{ type: "details", player }}
        clubs={[]}
        starterClub={null}
        mutations={mutationsMock() as never}
        onClose={vi.fn()}
        onFinish={vi.fn()}
        onOpen={onOpen}
      />,
    )

    await user.click(screen.getByRole("button", { name: /Editar/i }))
    expect(onOpen).toHaveBeenCalledWith({ type: "edit", player })
  })

  it("abre compra no branch default", () => {
    const player = makePlayer({ club_id: null })
    renderWithProviders(
      <PlayersDialogHost
        dialog={{ type: "buy", player }}
        clubs={[makeClub()]}
        starterClub={null}
        mutations={mutationsMock() as never}
        onClose={vi.fn()}
        onFinish={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByRole("heading", { name: "Comprar jogador" })).toBeInTheDocument()
  })
})
