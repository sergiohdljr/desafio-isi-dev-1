import { api } from "@/lib/http"
import type { Club, ClubSort, CreateClubInput } from "@/features/clubs/types/club.types"

function listClubs(sort?: ClubSort) {
  return api.get<Club[]>("/clubs", { params: { sort } }).then((response) => response.data)
}

function createClub(input: CreateClubInput) {
  return api.post<Club>("/clubs", input).then((response) => response.data)
}

export { createClub, listClubs }
