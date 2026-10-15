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
  return api
    .put<Lineup>(`/clubs/${id}/lineup`, { formation, player_ids: playerIds })
    .then((response) => response.data)
}

export type { ClubTransaction, Formation, Lineup, TransactionFilter, TransactionList, TransactionSummary, TransactionType }
export { createClub, exportClubTransactions, getClub, getLineup, listClubTransactions, listClubs, saveLineup }
