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
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.position) params.set("position", query.position)
  if (query.condition) params.set("condition", query.condition)
  if (query.free !== undefined) params.set("free", String(query.free))
  if (query.clubId !== undefined) params.set("club_id", String(query.clubId))
  if (query.minAge !== undefined) params.set("min_age", String(query.minAge))
  if (query.maxAge !== undefined) params.set("max_age", String(query.maxAge))
  if (query.minValue !== undefined) params.set("min_value", String(query.minValue))
  if (query.maxValue !== undefined) params.set("max_value", String(query.maxValue))
  if (query.sort) params.set("sort", query.sort)
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  const search = params.toString()
  return api<PlayerList>(`/players${search ? `?${search}` : ""}`)
}

function createPlayer(input: CreatePlayerInput) {
  return api<Player>("/players", { method: "POST", body: JSON.stringify(input) })
}

function updatePlayer(id: number, input: UpdatePlayerInput) {
  return api<Player>(`/players/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

function changePlayerCondition(id: number, condition: Condition) {
  return api<Player>(`/players/${id}/condition`, {
    method: "PATCH",
    body: JSON.stringify({ condition }),
  })
}

function deletePlayer(id: number) {
  return api<void>(`/players/${id}`, { method: "DELETE" })
}

function buyPlayer(id: number, clubId: number, loyaltyUntil: string) {
  return api<unknown>(`/players/${id}/buy`, {
    method: "POST",
    body: JSON.stringify({ club_id: clubId, loyalty_until: loyaltyUntil }),
  })
}

export { buyPlayer, changePlayerCondition, createPlayer, deletePlayer, listPlayers, updatePlayer }
