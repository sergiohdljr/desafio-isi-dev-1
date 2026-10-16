import { api } from "@/lib/http"
import type { Club, ClubDetail, ClubSort, CreateClubInput } from "@/features/clubs/types/club.types"
import type { Formation, Lineup } from "@/features/clubs/types/lineup.types"
import type { TransactionFilter, TransactionList } from "@/features/clubs/types/transactions.types"

function listClubs(sort?: ClubSort) {
  return api.get<Club[]>("/clubs", { params: { sort } }).then((response) => response.data)
}

function createClub(input: CreateClubInput) {
  return api.post<Club>("/clubs", input).then((response) => response.data)
}

function getClub(id: number) {
  return api.get<ClubDetail>(`/clubs/${id}`).then((response) => response.data)
}

function transactionParams(filter?: TransactionFilter) {
  return {
    type: filter?.types && filter.types.length > 0 && filter.types.length < 2 ? filter.types.join(",") : undefined,
    player_id: filter?.playerId,
  }
}

function listClubTransactions(id: number, filter?: TransactionFilter) {
  return api
    .get<TransactionList>(`/clubs/${id}/transactions`, { params: transactionParams(filter) })
    .then((response) => response.data)
}

function exportClubTransactions(id: number, filter?: TransactionFilter) {
  return api
    .get<Blob>(`/clubs/${id}/transactions/export`, { params: transactionParams(filter), responseType: "blob" })
    .then((response) => response.data)
}

function getLineup(id: number) {
  return api.get<Lineup>(`/clubs/${id}/lineup`).then((response) => response.data)
}

function saveLineup(id: number, formation: Formation, playerIds: number[]) {
  return api.put<Lineup>(`/clubs/${id}/lineup`, { formation, player_ids: playerIds }).then((response) => response.data)
}

export { createClub, exportClubTransactions, getClub, getLineup, listClubTransactions, listClubs, saveLineup }
