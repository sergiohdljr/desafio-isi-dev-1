import { getLineup } from "@/features/clubs/api/clubs.api"
import type { Club } from "@/features/clubs/types/club.types"
import type { MatchSide } from "@/features/league/utils/incomplete-clubs"

async function matchSides(homeId: string, awayId: string, clubs: Club[]): Promise<MatchSide[]> {
  const [home, away] = await Promise.all([lineupOf(homeId), lineupOf(awayId)])
  return [sideOf(homeId, clubs, home?.complete), sideOf(awayId, clubs, away?.complete)]
}

function sideOf(id: string, clubs: Club[], complete: boolean | undefined): MatchSide {
  return {
    id,
    name: clubs.find((club) => String(club.id) === id)?.name,
    complete: complete ?? false,
  }
}

function lineupOf(id: string) {
  return getLineup(Number(id)).catch(() => null)
}

export { matchSides }
