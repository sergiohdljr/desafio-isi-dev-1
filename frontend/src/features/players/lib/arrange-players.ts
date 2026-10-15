import type { Player, PlayerScope, PlayerSort, Position } from "@/features/players/types/player.types"

const AGE_MIN = 16
const AGE_MAX = 45
const MARKET_VALUE_MIN = 0
const MARKET_VALUE_MAX = 550

const POSITION_ORDER: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
}

type DirectoryQuery = {
  search?: string
  position?: Position
  condition?: Player["condition"]
  clubId?: number
  minAge?: number
  maxAge?: number
  minValue?: number
  maxValue?: number
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

function foldName(value: string) {
  return value.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase()
}

function normalizeSearch(value: string) {
  return foldName(value.trim().replace(/\s+/g, " "))
}

function compareNames(left: string, right: string) {
  const foldedLeft = foldName(left)
  const foldedRight = foldName(right)
  if (foldedLeft < foldedRight) return -1
  if (foldedLeft > foldedRight) return 1
  return 0
}

function cents(value: number) {
  return Math.round(value * 100)
}

function matchesShared(player: Player, query: DirectoryQuery) {
  if (query.search && !foldName(player.name).includes(normalizeSearch(query.search))) return false
  if (query.position && player.position !== query.position) return false
  if (query.condition && player.condition !== query.condition) return false
  if (query.minAge !== undefined || query.maxAge !== undefined) {
    const minAge = query.minAge ?? AGE_MIN
    const maxAge = query.maxAge ?? AGE_MAX
    if (player.age < minAge || player.age > maxAge) return false
  }
  if (query.minValue !== undefined || query.maxValue !== undefined) {
    const minValue = cents(query.minValue ?? MARKET_VALUE_MIN)
    const maxValue = cents(query.maxValue ?? MARKET_VALUE_MAX)
    const marketValue = cents(player.market_value)
    if (marketValue < minValue || marketValue > maxValue) return false
  }
  return true
}

function matchesScope(player: Player, query: DirectoryQuery) {
  if (query.scope === "free" && player.club_id !== null) return false
  if (query.scope === "signed" && player.club_id === null) return false
  if (query.clubId !== undefined && player.club_id !== query.clubId) return false
  return true
}

function compareBy(left: Player, right: Player, sort: PlayerSort) {
  switch (sort) {
    case "name":
      return compareNames(left.name, right.name)
    case "value_asc":
      return cents(left.market_value) - cents(right.market_value)
    case "value_desc":
      return cents(right.market_value) - cents(left.market_value)
    case "age_asc":
      return left.age - right.age
    case "age_desc":
      return right.age - left.age
    case "position":
      return POSITION_ORDER[left.position] - POSITION_ORDER[right.position]
  }
}

function comparePlayers(left: Player, right: Player, sort: PlayerSort) {
  const bySort = compareBy(left, right, sort)
  if (bySort !== 0) return bySort
  const byName = compareNames(left.name, right.name)
  if (byName !== 0) return byName
  return left.id - right.id
}

function arrangePlayers(players: Player[], query: DirectoryQuery): PlayerDirectory {
  const shared = players.filter((player) => matchesShared(player, query))
  const signed = shared.filter(
    (player) => player.club_id !== null && (query.clubId === undefined || player.club_id === query.clubId),
  )
  const visible = shared
    .filter((player) => matchesScope(player, query))
    .sort((left, right) => comparePlayers(left, right, query.sort))
  const totalItems = visible.length
  const start = (query.page - 1) * query.limit

  return {
    players: visible.slice(start, start + query.limit),
    totalItems,
    totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / query.limit),
    counts: {
      all: shared.length,
      free: shared.filter((player) => player.club_id === null).length,
      signed: signed.length,
    },
  }
}

export type { DirectoryQuery, PlayerDirectory }
export { arrangePlayers }
