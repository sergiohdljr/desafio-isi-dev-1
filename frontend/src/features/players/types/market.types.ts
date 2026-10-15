type MarketTransaction = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  value: number
  fee: number
  cash_change: number
  club_cash: number
}

type Sale = MarketTransaction & {
  type: "VENDA"
  penalty: number
  profit: number
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: "RESCINDIDO" | "ENCERRADO"
}

type Purchase = MarketTransaction & {
  type: "COMPRA"
  created_at: string
  contract: {
    purchase_value: number
    loyalty_until: string
    status: "ATIVO"
  }
}

export type { Purchase, Sale }
