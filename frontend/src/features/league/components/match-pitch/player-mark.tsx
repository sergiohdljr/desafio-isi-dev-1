import { HeartPulse } from "lucide-react"
import { Ball } from "@/features/league/components/match-pitch/ball"
import { attributeLine } from "@/features/league/utils/pitch-slot"
import type { Player } from "@/features/players/types/player.types"
import { initials } from "@/features/players/utils/player-display"

function PlayerMark({
  player,
  top,
  left,
  home,
  scored,
}: {
  player: Player
  top: string
  left: string
  home: boolean
  scored: boolean
}) {
  return (
    <span className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2" style={{ top, left }}>
      <span
        className={
          home
            ? "relative inline-flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-body-sm-medium text-primary-foreground shadow-md"
            : "relative inline-flex size-9 items-center justify-center rounded-full border-2 border-background bg-background text-body-sm-medium text-foreground shadow-md"
        }
      >
        {initials(player.name)}
        {player.condition === "MAL_CONDICIONADO" ? (
          <span className="absolute -top-1.5 -left-1.5 inline-flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-background bg-warning text-white">
            <HeartPulse className="size-2.5" aria-hidden />
          </span>
        ) : null}
        {scored ? (
          <span className="absolute -top-1.5 left-6">
            <Ball marker />
          </span>
        ) : null}
      </span>
      <span className="flex flex-col items-center gap-0.5">
        <span className="rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium whitespace-nowrap text-pitch-foreground">
          {player.name}
        </span>
        <span className="rounded-full bg-black/30 px-1.5 text-caption-xs whitespace-nowrap text-pitch-muted-foreground">
          {player.position} · {attributeLine(player)}
        </span>
      </span>
    </span>
  )
}

export { PlayerMark }
