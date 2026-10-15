import { DIFFERENT_CLUBS_MESSAGE } from "@/features/league/consts/new-match"

type MatchFailureKind = "selection" | "incomplete" | "refused"

function hasDifferentClubs(homeId: string, awayId: string) {
  return Boolean(homeId && awayId && homeId !== awayId)
}

function matchFailureKind(failure: string | null): MatchFailureKind | null {
  if (failure === null) return null
  if (failure === DIFFERENT_CLUBS_MESSAGE) return "selection"
  if (failure.toLowerCase().includes("escal")) return "incomplete"
  return "refused"
}

export type { MatchFailureKind }
export { hasDifferentClubs, matchFailureKind }
