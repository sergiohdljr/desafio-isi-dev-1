import type { Formation } from "@/features/clubs/types/lineup.types"
import { PlayerMark } from "@/features/league/components/match-pitch/player-mark"
import { placeOnPitch } from "@/features/league/utils/pitch-slot"
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
  return (
    <>
      {placeOnPitch(formation, players, side).map(({ player, top, left }) => (
        <PlayerMark
          key={player.id}
          player={player}
          top={top}
          left={left}
          home={side === "home"}
          scored={scorers.has(player.id)}
        />
      ))}
    </>
  )
}

export { Side }
