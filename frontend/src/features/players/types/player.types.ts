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

type PlayerQuery = {
  search?: string
  position?: Position
  condition?: Condition
  free?: boolean
  clubId?: number
  minAge?: number
  maxAge?: number
  minValue?: number
  maxValue?: number
  sort?: PlayerSort
  page?: number
  limit?: number
}

type CreatePlayerInput = {
  name: string
  position: Position
  agility: number
  age: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
}

type UpdatePlayerInput = {
  name: string
  position: Position
  agility: number
  age: number
}

export type {
  Condition,
  CreatePlayerInput,
  Player,
  PlayerList,
  PlayerQuery,
  PlayerScope,
  PlayerSort,
  Position,
  UpdatePlayerInput,
}
