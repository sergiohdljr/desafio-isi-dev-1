import { api } from "@/lib/http"
import type { Match, MatchSummary } from "@/features/league/types/match.types"
import type { Standing } from "@/features/league/types/standing.types"

function listMatches(clubId?: number) {
  return api.get<MatchSummary[]>("/matches", { params: { club_id: clubId } }).then((response) => response.data)
}

function getMatch(id: number) {
  return api.get<Match>(`/matches/${id}`).then((response) => response.data)
}

function playMatch(homeClubId: number, awayClubId: number) {
  return api
    .post<Match>("/matches", { home_club_id: homeClubId, away_club_id: awayClubId })
    .then((response) => response.data)
}

function listStandings() {
  return api.get<Standing[]>("/standings").then((response) => response.data)
}

export { getMatch, listMatches, listStandings, playMatch }
