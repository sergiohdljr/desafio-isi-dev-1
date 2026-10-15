import type { Condition } from "@/features/players/types/player.types"

function conditionVariant(condition: Condition) {
  if (condition === "APTO") return "success" as const
  if (condition === "MAL_CONDICIONADO") return "warning" as const
  return "destructive" as const
}

export { conditionVariant }
