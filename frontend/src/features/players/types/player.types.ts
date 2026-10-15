type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA"
type Condition = "APTO" | "MAL_CONDICIONADO" | "DOENTE"
type PlayerSort = "name" | "value_asc" | "value_desc" | "age_asc" | "age_desc" | "position"
type PlayerScope = "all" | "free" | "signed"

type Player = {
  id: number
  name: string
  position: Position
  agility: number
  age: number
  condition: Condition
  base_value: number
  market_value: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
  overall: number
  club_id: number | null
}

type PlayerList = {
  data: Player[]
  meta: {
    page: number
    limit: number
    total_items: number
    total_pages: number
  }
}

type PlayerFilters = {
  search?: string
  position?: Position
  condition?: Condition
  clubId?: number
  minAge?: number
  maxAge?: number
  minValue?: number
  maxValue?: number
}

type PlayerQuery = PlayerFilters & {
  free?: boolean
  sort?: PlayerSort
  page?: number
  limit?: number
}

type CreatePlayerInput = Pick<
  Player,
  | "name"
  | "position"
  | "agility"
  | "age"
  | "pace"
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending"
  | "physical"
  | "potential"
>

type UpdatePlayerInput = Pick<CreatePlayerInput, "name" | "position" | "agility" | "age">

type DirectoryQuery = PlayerFilters & {
  sort: PlayerSort
  scope: PlayerScope
  page: number
  limit: number
}

type PlayerDirectory = {
  players: Player[]
  totalItems: number
  totalPages: number
  counts: {
    all: number
    free: number
    signed: number
  }
}

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

export type {
  Condition,
  CreatePlayerInput,
  DirectoryQuery,
  Player,
  PlayerDirectory,
  PlayerList,
  PlayerQuery,
  PlayerScope,
  PlayerSort,
  Position,
  Purchase,
  Sale,
  UpdatePlayerInput,
}
