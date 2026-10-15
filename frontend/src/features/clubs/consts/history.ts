import { BadgePercent, HandCoins, ShoppingCart, TriangleAlert, TrendingUp } from "lucide-react"
import type { TransactionSummary, TransactionType } from "@/features/clubs/types/transactions.types"

const DEFAULT_TRANSACTION_TYPES: TransactionType[] = ["COMPRA", "VENDA"]

const HISTORY_CSV_FILENAME = "historico.csv"

const HISTORY_TOTALS = [
  { key: "total_spent", label: "Total pago em compras", hint: "Valor + taxa", icon: ShoppingCart },
  { key: "total_received", label: "Total recebido em vendas", hint: "Crédito líquido", icon: HandCoins },
  { key: "total_fees", label: "Taxas e comissões", hint: "Somadas", icon: BadgePercent },
  { key: "total_penalties", label: "Multas", hint: "Por fidelidade", icon: TriangleAlert },
  { key: "total_profit", label: "Lucro total", hint: "Soma dos lucros, com sinal", icon: TrendingUp },
] as const satisfies ReadonlyArray<{
  key: keyof TransactionSummary
  label: string
  hint: string
  icon: typeof ShoppingCart
}>

export { DEFAULT_TRANSACTION_TYPES, HISTORY_CSV_FILENAME, HISTORY_TOTALS }
