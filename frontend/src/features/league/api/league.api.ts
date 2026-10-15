import { api } from "@/lib/http"

type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1"
type MatchResult = "MANDANTE" | "VISITANTE" | "EMPATE"
type DuelAttribute = "shooting" | "passing" | "dribbling" | "defending"

type MatchSide = {
  club_id: number
  club_name: string
  formation: Formation
  goals: number
}

type MatchSummary = {
  id: number
  played_at: string
  home: MatchSide
  away: MatchSide
  result: MatchResult
}

type DuelSide = {
  player_id: number
  player_name: string
  position: string
  condition: "APTO" | "MAL_CONDICIONADO"
  attribute: DuelAttribute
  value: number
}

type Match = MatchSummary & {
  duels: {
    order: number
    attacking_club_id: number
    attacker: DuelSide
    defender: DuelSide
    goal: boolean
  }[]
}

type Standing = {
  position: number
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

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

export type { DuelAttribute, Match, MatchResult, MatchSummary, Standing }
export { getMatch, listMatches, listStandings, playMatch }
