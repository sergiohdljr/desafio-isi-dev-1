import type { Formation } from "@/features/clubs/types/lineup.types"
import { type DUEL_ATTRIBUTES, type MATCH_RESULTS } from "@/features/league/consts/match"
import type { Condition } from "@/features/players/types/player.types"

type MatchResult = (typeof MATCH_RESULTS)[number]
type DuelAttribute = (typeof DUEL_ATTRIBUTES)[number]

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
  condition: Exclude<Condition, "DOENTE">
  attribute: DuelAttribute
  value: number
}

type MatchDuel = {
  order: number
  attacking_club_id: number
  attacker: DuelSide
  defender: DuelSide
  goal: boolean
}

type Match = MatchSummary & {
  duels: MatchDuel[]
}

export type { DuelAttribute, DuelSide, Match, MatchDuel, MatchResult, MatchSide, MatchSummary }
