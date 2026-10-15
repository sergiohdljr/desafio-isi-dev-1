import { RESULT_LABELS } from "@/features/league/consts/match"
import type { MatchResult } from "@/features/league/types/match.types"

function resultLabel(result: MatchResult) {
  return RESULT_LABELS[result]
}

function resultVariant(result: MatchResult) {
  if (result === "EMPATE") return "secondary" as const
  return "success" as const
}

export { resultLabel, resultVariant }
