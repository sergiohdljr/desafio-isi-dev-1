import type { TransactionSummary } from "@/features/clubs/types/transactions.types"

function profitTotalTone(key: keyof TransactionSummary, value: number) {
  if (key !== "total_profit") return ""
  if (value > 0) return "text-success"
  if (value < 0) return "text-destructive"
  return ""
}

export { profitTotalTone }
