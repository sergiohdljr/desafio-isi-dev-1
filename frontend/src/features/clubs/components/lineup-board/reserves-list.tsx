import { Badge } from "@/components/ui/badge"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { conditionLabel, positionLabel } from "@/features/players/utils/player-display"

function ReservesList({ reserves }: { reserves: SquadPlayer[] }) {
  return (
    <section className="rounded-[12px] border border-border bg-card p-4 shadow-xs">
      <h2 className="text-body-sm-semibold">Reservas</h2>
      <p className="mb-3 text-caption-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
      <ul className="flex flex-col gap-2">
        {reserves.map((player) => (
          <li key={player.id} className="flex items-center justify-between gap-2">
            <span>
              <span className="block text-body-sm-medium">{player.name}</span>
              <span className="block text-caption-xs text-muted-foreground">{positionLabel(player.position)}</span>
            </span>
            <Badge variant={conditionVariant(player.condition)} dot>
              {conditionLabel(player.condition)}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-caption-xs text-muted-foreground">Doente não pode ser escalado.</p>
    </section>
  )
}

export { ReservesList }
