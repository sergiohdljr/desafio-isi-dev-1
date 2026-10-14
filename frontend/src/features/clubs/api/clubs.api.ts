import { api } from "@/lib/http"
import type { Club } from "@/features/clubs/types/club.types"

function listClubs() {
  return api<Club[]>("/clubs")
}

export { listClubs }
