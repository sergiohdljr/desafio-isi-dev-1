import type { Formation } from "@/features/clubs/types/lineup.types"
import type { Player, Position } from "@/features/players/types/player.types"

const GOAL_LINE = 6.5
const DEFENSE_LINE = 17.9
const MIDFIELD_LINE = 28.8
const ATTACK_LINE = 39
const CENTER = "50%"
const HIGH = "32.3%"
const LOW = "67.7%"
const TOP = "26%"
const BOTTOM = "74%"

const PITCH_SLOTS: Record<Formation, { position: Position | "DEF"; top: string; line: number }[]> = {
  "3-1": [
    { position: "GOL", top: CENTER, line: GOAL_LINE },
    { position: "DEF", top: TOP, line: DEFENSE_LINE },
    { position: "DEF", top: CENTER, line: DEFENSE_LINE },
    { position: "DEF", top: BOTTOM, line: DEFENSE_LINE },
    { position: "ATA", top: CENTER, line: ATTACK_LINE },
  ],
  "2-2": [
    { position: "GOL", top: CENTER, line: GOAL_LINE },
    { position: "DEF", top: HIGH, line: DEFENSE_LINE },
    { position: "DEF", top: LOW, line: DEFENSE_LINE },
    { position: "ATA", top: HIGH, line: ATTACK_LINE },
    { position: "ATA", top: LOW, line: ATTACK_LINE },
  ],
  "2-1-1": [
    { position: "GOL", top: CENTER, line: GOAL_LINE },
    { position: "DEF", top: HIGH, line: DEFENSE_LINE },
    { position: "DEF", top: LOW, line: DEFENSE_LINE },
    { position: "MEI", top: CENTER, line: MIDFIELD_LINE },
    { position: "ATA", top: CENTER, line: ATTACK_LINE },
  ],
  "1-2-1": [
    { position: "GOL", top: CENTER, line: GOAL_LINE },
    { position: "DEF", top: CENTER, line: DEFENSE_LINE },
    { position: "MEI", top: HIGH, line: MIDFIELD_LINE },
    { position: "MEI", top: LOW, line: MIDFIELD_LINE },
    { position: "ATA", top: CENTER, line: ATTACK_LINE },
  ],
}

const RANK: Record<Position, number> = { GOL: 0, ZAG: 1, LAT: 2, MEI: 3, ATA: 4 }

function fits(slot: Position | "DEF", position: Position) {
  if (slot === "DEF") return position === "ZAG" || position === "LAT"
  return position === slot
}

function placeOnPitch(formation: Formation, players: Player[], side: "home" | "away") {
  const remaining = [...players].sort(
    (left, right) => RANK[left.position] - RANK[right.position] || left.name.localeCompare(right.name),
  )
  return PITCH_SLOTS[formation].flatMap((slot) => {
    const index = remaining.findIndex((player) => fits(slot.position, player.position))
    if (index < 0) return []
    const [player] = remaining.splice(index, 1)
    const line = side === "home" ? slot.line : 100 - slot.line
    return [{ player, top: slot.top, left: `${line}%` }]
  })
}

function attributeLine(player: Player) {
  if (player.position === "ATA") return `Fin ${player.shooting}`
  if (player.position === "MEI") return `Pas ${player.passing}`
  if (player.position === "LAT") return `Dri ${player.dribbling} · Def ${player.defending}`
  return `Def ${player.defending}`
}

export { attributeLine, fits, placeOnPitch }
