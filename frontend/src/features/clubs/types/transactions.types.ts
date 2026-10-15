type TransactionType = "COMPRA" | "VENDA"

type ClubTransaction = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: TransactionType
  value: number
  fee: number
  penalty: number
  profit: number
  cash_change: number
  created_at: string
}

type TransactionSummary = {
  total_spent: number
  total_received: number
  total_fees: number
  total_penalties: number
  total_profit: number
}

type TransactionList = {
  data: ClubTransaction[]
  summary: TransactionSummary
}

type TransactionFilter = {
  types?: TransactionType[]
  playerId?: number
}

export type {
  ClubTransaction,
  TransactionFilter,
  TransactionList,
  TransactionSummary,
  TransactionType,
}
