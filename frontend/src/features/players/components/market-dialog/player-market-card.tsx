import { Avatar } from "@/components/ui/avatar"
import { AVATAR_TONES, money } from "@/features/players/consts/directory"
import type { Player } from "@/features/players/types/player.types"
import { initials, positionLabel } from "@/features/players/utils/player-display"

function PlayerMarketCard({ player }: { player: Pick<Player, "id" | "name" | "position" | "age" | "market_value"> }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted-subtle px-3.5 py-3">
      <Avatar initials={initials(player.name)} className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-medium">{player.name}</p>
        <p className="text-caption-xs text-muted-foreground">
          {player.position} · {positionLabel(player.position)} · {player.age} anos
        </p>
      </div>
      <div className="text-right">
        <p className="text-caption-xs text-muted-foreground">Valor de mercado</p>
        <p className="text-heading-card">{money.format(player.market_value)}</p>
      </div>
    </div>
  )
}

export { PlayerMarketCard }
