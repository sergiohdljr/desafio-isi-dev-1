import { api } from "@/lib/http"
import type {
  Condition,
  CreatePlayerInput,
  Player,
  PlayerList,
  PlayerQuery,
  UpdatePlayerInput,
} from "@/features/players/types/player.types"

function listPlayers(query: PlayerQuery) {
  return api
    .get<PlayerList>("/players", { params: playerParams(query) })
    .then((response) => response.data)
}

function createPlayer(input: CreatePlayerInput) {
  return api.post<Player>("/players", input).then((response) => response.data)
}

function updatePlayer(id: number, input: UpdatePlayerInput) {
  return api.put<Player>(`/players/${id}`, input).then((response) => response.data)
}

function changePlayerCondition(id: number, condition: Condition) {
  return api
    .patch<Player>(`/players/${id}/condition`, { condition })
    .then((response) => response.data)
}

function deletePlayer(id: number) {
  return api.delete<void>(`/players/${id}`).then((response) => response.data)
}

type Sale = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: "VENDA"
  value: number
  fee: number
  penalty: number
  profit: number
  cash_change: number
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: "RESCINDIDO" | "ENCERRADO"
  club_cash: number
}

function sellPlayer(id: number) {
  return api.post<Sale>(`/players/${id}/sell`).then((response) => response.data)
}

type Purchase = {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: "COMPRA"
  value: number
  fee: number
  cash_change: number
  created_at: string
  contract: {
    purchase_value: number
    loyalty_until: string
    status: "ATIVO"
  }
  club_cash: number
}

function buyPlayer(id: number, clubId: number, loyaltyUntil: string) {
  return api
    .post<Purchase>(`/players/${id}/buy`, { club_id: clubId, loyalty_until: loyaltyUntil })
    .then((response) => response.data)
}

function playerParams(query: PlayerQuery) {
  return {
    search: query.search,
    position: query.position,
    condition: query.condition,
    free: query.free,
    club_id: query.clubId,
    min_age: query.minAge,
    max_age: query.maxAge,
    min_value: query.minValue,
    max_value: query.maxValue,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  }
}

export { buyPlayer, changePlayerCondition, createPlayer, deletePlayer, listPlayers, sellPlayer, updatePlayer }
export type { Purchase, Sale }
