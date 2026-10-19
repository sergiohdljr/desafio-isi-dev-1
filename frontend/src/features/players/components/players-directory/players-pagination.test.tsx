import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PlayersPagination } from "@/features/players/components/players-directory/players-pagination"

describe("PlayersPagination", () => {
  it("mostra o intervalo de jogadores", () => {
    render(
      <PlayersPagination
        page={1}
        totalPages={2}
        rangeStart={1}
        rangeEnd={10}
        totalItems={11}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText("Mostrando 1–10 de 11 jogadores")).toBeInTheDocument()
  })

  it("desabilita Anterior na primeira página e Próxima na última", () => {
    const { rerender } = render(
      <PlayersPagination
        page={1}
        totalPages={3}
        rangeStart={1}
        rangeEnd={10}
        totalItems={25}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByRole("button", { name: /Anterior/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Próxima/i })).toBeEnabled()

    rerender(
      <PlayersPagination
        page={3}
        totalPages={3}
        rangeStart={21}
        rangeEnd={25}
        totalItems={25}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByRole("button", { name: /Anterior/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /Próxima/i })).toBeDisabled()
  })

  it("chama onPageChange ao clicar em uma página", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <PlayersPagination
        page={1}
        totalPages={3}
        rangeStart={1}
        rangeEnd={10}
        totalItems={25}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByRole("button", { name: "2" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
