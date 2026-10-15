import { LINE_PLAYERS_NEEDED, STARTER_COUNT } from "@/features/clubs/consts/lineup"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Formation } from "@/features/clubs/types/lineup.types"

function incompleteLineupNotice({
  clubName,
  formation,
  savedCount,
  squad,
  sales,
}: {
  clubName: string
  formation: Formation | null
  savedCount: number
  squad: SquadPlayer[]
  sales: { player_id: number; player_name: string; type: string; created_at: string }[]
}) {
  if (!formation || savedCount >= STARTER_COUNT) return null
  const sold = sales
    .filter((item) => item.type === "VENDA" && !squad.some((player) => player.id === item.player_id))
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0]
  const sickLine = squad.filter((player) => player.position !== "GOL" && player.condition === "DOENTE")
  const eligibleLine = squad.filter((player) => player.position !== "GOL" && player.condition !== "DOENTE")
  const saleText = sold
    ? `${sold.player_name} foi vendido e saiu da escalação: a ${formation} continua salva, com ${savedCount} ${savedCount === 1 ? "titular" : "titulares"}.`
    : `A ${formation} continua salva, com ${savedCount} ${savedCount === 1 ? "titular" : "titulares"}.`
  const blocked =
    sickLine.length > 0 && eligibleLine.length < LINE_PLAYERS_NEEDED
      ? ` Com o ${sickLine.map((player) => player.name).join(" e ")} DOENTE, sobram ${eligibleLine.length} jogadores de linha que podem ser escalados, e nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.`
      : ""
  return {
    title: `Escalação incompleta: o ${clubName} não pode jogar partidas`,
    description: `${saleText}${blocked}`,
  }
}

export { incompleteLineupNotice }
