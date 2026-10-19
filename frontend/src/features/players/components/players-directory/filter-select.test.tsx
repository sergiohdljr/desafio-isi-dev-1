import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FilterSelect } from "@/features/players/components/players-directory/filter-select"

const OPTIONS = [
  { value: "ATA", label: "Atacante" },
  { value: "MEI", label: "Meia" },
]

describe("FilterSelect", () => {
  it("escolhe uma opção e chama onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterSelect label="Posição" icon={<span>p</span>} value="" options={OPTIONS} onChange={onChange} />,
    )

    await user.click(screen.getByRole("combobox", { name: "Posição" }))
    await user.click(await screen.findByRole("option", { name: "Atacante" }))
    expect(onChange).toHaveBeenCalledWith("ATA")
  })

  it("mapeia a opção all para string vazia", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterSelect label="Condição" icon={<span>c</span>} value="ATA" options={OPTIONS} onChange={onChange} />,
    )

    await user.click(screen.getByRole("combobox", { name: "Condição" }))
    await user.click(await screen.findByRole("option", { name: "Condição" }))
    expect(onChange).toHaveBeenCalledWith("")
  })

  it("não abre quando disabled", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterSelect
        label="Clube"
        icon={<span>c</span>}
        value=""
        options={OPTIONS}
        disabled
        onChange={onChange}
      />,
    )

    const trigger = screen.getByRole("combobox", { name: "Clube" })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})
