import { api } from "@/lib/http"
import type { Player } from "@/features/players/types/player.types"
import type { Club, ClubDetail, ClubSort, CreateClubInput } from "@/features/clubs/types/club.types"

type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1"

type Lineup = {
  club_id: number
  formation: Formation | null
  complete: boolean
  players: Player[]
}

function listClubs(sort?: ClubSort) {
  return api.get<Club[]>("/clubs", { params: { sort } }).then((response) => response.data)
}

function createClub(input: CreateClubInput) {
  return api.post<Club>("/clubs", input).then((response) => response.data)
}

function getClub(id: number) {
  return api.get<ClubDetail>(`/clubs/${id}`).then((response) => response.data)
}

function listClubTransactions(id: number) {
  return api.get<{ data: unknown[] }>(`/clubs/${id}/transactions`).then((response) => response.data.data)
}

function getLineup(id: number) {
  return api.get<Lineup>(`/clubs/${id}/lineup`).then((response) => response.data)
}

function saveLineup(id: number, formation: Formation, playerIds: number[]) {
  return api
    .put<Lineup>(`/clubs/${id}/lineup`, { formation, player_ids: playerIds })
    .then((response) => response.data)
}

export type { Formation, Lineup }
export { createClub, getClub, getLineup, listClubTransactions, listClubs, saveLineup }
