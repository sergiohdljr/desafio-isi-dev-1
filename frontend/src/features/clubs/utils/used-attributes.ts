import type { SquadPlayer } from "@/features/clubs/types/club.types"

function usedAttributes(player: SquadPlayer) {
  if (player.position === "ATA") return `Finalização ${player.shooting}`
  if (player.position === "MEI") return `Passe ${player.passing}`
  if (player.position === "LAT") return `Drible ${player.dribbling} Defesa ${player.defending}`
  return `Defesa ${player.defending}`
}

export { usedAttributes }
