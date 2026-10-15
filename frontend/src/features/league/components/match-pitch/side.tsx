import type { Formation } from "@/features/clubs/types/lineup.types"
import { PlayerMark } from "@/features/league/components/match-pitch/player-mark"
import { AWAY_LEFT, HOME_LEFT, PITCH_COLUMNS } from "@/features/league/consts/match"
import { fits } from "@/features/league/utils/pitch-slot"
import type { Player } from "@/features/players/types/player.types"

function Side({
  formation,
  players,
  side,
  scorers,
}: {
  formation: Formation
  players: Player[]
  side: "home" | "away"
  scorers: Set<number>
}) {
  const remaining = [...players]
  const columns = PITCH_COLUMNS[formation]
  const lefts = side === "home" ? HOME_LEFT : AWAY_LEFT
  return (
    <>
      {columns.map((column, columnIndex) =>
        column.map((slot) => {
          const index = remaining.findIndex((player) => fits(slot.position, player.position))
          if (index < 0) return null
          const [player] = remaining.splice(index, 1)
          return (
            <PlayerMark
              key={player.id}
              player={player}
              top={slot.top}
              left={lefts[columnIndex] ?? lefts[lefts.length - 1]}
              home={side === "home"}
              scored={scorers.has(player.id)}
            />
          )
        }),
      )}
    </>
  )
}

export { Side }
