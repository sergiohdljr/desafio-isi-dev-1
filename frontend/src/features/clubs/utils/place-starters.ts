import { SLOTS, STARTER_COUNT } from "@/features/clubs/consts/lineup"
import type { Formation } from "@/features/clubs/types/lineup.types"
import { slotFits } from "@/features/clubs/utils/slot-fits"
import type { Player } from "@/features/players/types/player.types"

function emptyStarters() {
  return Array.from({ length: STARTER_COUNT }, () => null as number | null)
}

function placeStarters(formation: Formation, players: Player[]) {
  const remaining = [...players]
  return SLOTS[formation].map((slot) => {
    const index = remaining.findIndex((player) => slotFits(slot.kind, player.position))
    if (index < 0) return null
    const [player] = remaining.splice(index, 1)
    return player.id
  })
}

export { emptyStarters, placeStarters }
