import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RangeFilter } from "@/features/players/components/players-directory/range-filter"

describe("RangeFilter", () => {
  it("abre o painel e altera mínimo e máximo", async () => {
    const user = userEvent.setup()
    const onMinChange = vi.fn()
    const onMaxChange = vi.fn()
    render(
      <RangeFilter
        label="Idade"
        icon={<span>i</span>}
        min=""
        max=""
        onMinChange={onMinChange}
        onMaxChange={onMaxChange}
      />,
    )

    const trigger = screen.getByRole("button", { name: "Idade" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Mínimo")).toBeInTheDocument()
    expect(screen.getByText("Máximo")).toBeInTheDocument()

    const [minInput, maxInput] = screen.getAllByRole("textbox")
    await user.type(minInput, "18")
    await user.type(maxInput, "30")
    expect(onMinChange).toHaveBeenCalled()
    expect(onMaxChange).toHaveBeenCalled()
  })

  it("fecha ao clicar fora", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <RangeFilter
          label="Valor"
          icon={<span>v</span>}
          min=""
          max=""
          onMinChange={vi.fn()}
          onMaxChange={vi.fn()}
        />
        <button type="button">fora</button>
      </div>,
    )

    const trigger = screen.getByRole("button", { name: "Valor" })
    await user.click(trigger)
    expect(screen.getByText("Mínimo")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "fora" }))
    expect(screen.queryByText("Mínimo")).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})
