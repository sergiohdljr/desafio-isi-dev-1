import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import type { Player } from "@/features/players/types/player.types"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { conditionLabel, initials, positionLabel } from "@/features/players/utils/player-display"

function PlayerIdentity({ player, badge }: { player: Player; badge: "condition" | "free" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted-subtle px-3.5 py-3">
      <Avatar initials={initials(player.name)} className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-medium">{player.name}</p>
        <p className="text-caption-xs text-muted-foreground">
          {player.position} · {positionLabel(player.position)} · {player.age} anos
        </p>
      </div>
      {badge === "free" ? (
        <Badge variant="secondary">Livre</Badge>
      ) : (
        <Badge variant={conditionVariant(player.condition)} dot>
          {conditionLabel(player.condition)}
        </Badge>
      )}
    </div>
  )
}

export { PlayerIdentity }
