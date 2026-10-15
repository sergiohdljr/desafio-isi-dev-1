import type { Club } from "@/features/clubs/types/club.types"

function clubAcronym(clubs: Club[], clubId: number, name: string) {
  return clubs.find((club) => club.id === clubId)?.acronym ?? name.slice(0, 3).toUpperCase()
}

export { clubAcronym }
