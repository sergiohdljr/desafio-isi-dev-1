import { api } from "@/lib/http"
import type { Club } from "@/features/clubs/types/club.types"

function listClubs() {
  return api.get<Club[]>("/clubs").then((response) => response.data)
}

export { listClubs }
