import type { Player, Position } from "@/features/players/types/player.types"

function fits(slot: Position | "DEF", position: Position) {
  if (slot === "DEF") return position === "ZAG" || position === "LAT"
  return position === slot
}

function attributeLine(player: Player) {
  if (player.position === "ATA") return `Fin ${player.shooting}`
  if (player.position === "MEI") return `Pas ${player.passing}`
  if (player.position === "LAT") return `Dri ${player.dribbling} · Def ${player.defending}`
  return `Def ${player.defending}`
}

export { attributeLine, fits }
