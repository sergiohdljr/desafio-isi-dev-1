import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HistorySummary } from "@/features/clubs/components/club-history/history-summary"
import { HistoryTable } from "@/features/clubs/components/club-history/history-table"
import type { ClubTransaction } from "@/features/clubs/types/transactions.types"

const sale: ClubTransaction = {
  id: 1,
  club_id: 1,
  player_id: 1,
  player_name: "Meia Lua",
  type: "VENDA",
  value: 40,
  fee: 0.3,
  penalty: 4,
  profit: 3,
  cash_change: 35.7,
  created_at: "2026-11-05T16:40:00-03:00",
}

const loss: ClubTransaction = {
  ...sale,
  id: 2,
  player_name: "Renan Castro",
  profit: -5.7,
  cash_change: -22.25,
}

const purchase: ClubTransaction = {
  ...sale,
  id: 3,
  type: "COMPRA",
  player_name: "Sávio Lima",
  profit: 0,
  cash_change: -22.25,
}

describe("cores do histórico", () => {
  it("pinta lucro e variação de caixa pelo sinal", () => {
    render(<HistoryTable rows={[sale, loss, purchase]} />)

    expect(screen.getByText("Compra").closest("[data-slot=badge]")).toHaveClass("border-border")
    expect(screen.getAllByText("Venda")[0].closest("[data-slot=badge]")).toHaveClass("bg-secondary")
    expect(screen.getByText("+3,00")).toHaveClass("text-success")
    expect(screen.getByText("+35,70")).toHaveClass("text-success", "text-body-sm-semibold")
    expect(screen.getByText("−5,70")).toHaveClass("text-destructive")
    expect(screen.getAllByText("−22,25")[0]).toHaveClass("text-destructive", "text-body-sm-semibold")
  })

  it("pinta o lucro total pelo sinal", () => {
    render(
      <HistorySummary
        summary={{
          total_spent: 309.96,
          total_received: 61.54,
          total_fees: 12.63,
          total_penalties: 10.46,
          total_profit: -2.7,
        }}
      />,
    )

    expect(screen.getByText("−2,70")).toHaveClass("text-destructive")
  })
})
