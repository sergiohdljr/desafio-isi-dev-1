import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ActiveFilterChips } from "@/features/players/components/players-directory/active-filter-chips"

describe("ActiveFilterChips", () => {
  it("não renderiza quando não há filtros", () => {
    const { container } = render(
      <ActiveFilterChips filters={[]} onClearAll={vi.fn()} onClearOne={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("remove um filtro pelo chip", async () => {
    const user = userEvent.setup()
    const clear = vi.fn()
    const onClearOne = vi.fn((fn: () => void) => fn())
    render(
      <ActiveFilterChips
        filters={[{ id: "pos", label: "ATA", clear }]}
        onClearAll={vi.fn()}
        onClearOne={onClearOne}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Remover filtro ATA" }))
    expect(onClearOne).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledOnce()
  })

  it("limpa todos os filtros", async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn()
    render(
      <ActiveFilterChips
        filters={[{ id: "pos", label: "ATA", clear: vi.fn() }]}
        onClearAll={onClearAll}
        onClearOne={vi.fn()}
      />,
    )

    expect(screen.getByText("Filtros ativos:")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })
})
