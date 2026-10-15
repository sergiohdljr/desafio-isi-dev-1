import type { SlotKind } from "@/features/clubs/types/lineup.types"
import type { Position } from "@/features/players/types/player.types"

function slotFits(kind: SlotKind, position: Position) {
  if (kind === "DEF") return position === "ZAG" || position === "LAT"
  return position === kind
}

export { slotFits }
