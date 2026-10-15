import type { Player } from "@/features/players/types/player.types"

type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1"
type SlotKind = "GOL" | "DEF" | "MEI" | "ATA"

type LineupSlot = {
  kind: SlotKind
  label: string
  hint: string
}

type Lineup = {
  club_id: number
  formation: Formation | null
  complete: boolean
  players: Player[]
}

export type { Formation, Lineup, LineupSlot, SlotKind }
