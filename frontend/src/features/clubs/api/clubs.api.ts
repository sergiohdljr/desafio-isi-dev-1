import { api } from "@/lib/http"
import type { Club, ClubDetail, ClubSort, CreateClubInput } from "@/features/clubs/types/club.types"

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

export { createClub, getClub, listClubTransactions, listClubs }
