import { ShoppingCart } from "lucide-react"
import type { Club } from "@/features/clubs/types/club.types"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayerActionsMenu } from "@/features/players/components/player-actions-menu"
import { AVATAR_TONES, money } from "@/features/players/consts/directory"
import type { Player } from "@/features/players/types/player.types"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { agilityTone, conditionLabel, initials, positionLabel } from "@/features/players/utils/player-display"

const TABLE_HEADINGS = [
  "Jogador",
  "Posição",
  "Overall",
  "Agilidade",
  "Idade",
  "Condição",
  "Valor base",
  "Valor de mercado",
  "Clube",
  "",
]

function PlayersTable({
  players,
  clubs,
  pending,
  onDetails,
  onEdit,
  onCondition,
  onBuy,
  onDelete,
}: {
  players: Player[]
  clubs: Club[]
  pending: boolean
  onDetails: (player: Player) => void
  onEdit: (player: Player) => void
  onCondition: (player: Player) => void
  onBuy: (player: Player) => void
  onDelete: (player: Player) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-240 border-collapse text-left">
        <thead className="border-b border-border text-caption-xs-medium text-muted-foreground">
          <tr>
            {TABLE_HEADINGS.map((heading) => (
              <th key={heading || "acoes"} className="px-3 py-2 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const club = clubs.find((item) => item.id === player.club_id)
            return (
              <tr key={player.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      initials={initials(player.name)}
                      className={AVATAR_TONES[player.id % AVATAR_TONES.length]}
                    />
                    <span>
                      <span className="block text-body-sm-medium">{player.name}</span>
                      <span className="block text-caption-xs text-muted-foreground">
                        {positionLabel(player.position)}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{player.position}</Badge>
                </td>
                <td className="px-3 py-2 text-body-sm tabular-nums">{player.overall}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2 text-body-sm tabular-nums">
                    {player.agility}
                    <span className="h-1 w-10 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <span
                        className={`block h-full ${agilityTone(player.agility)}`}
                        style={{ width: `${player.agility}%` }}
                      />
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 text-body-sm tabular-nums">{player.age}</td>
                <td className="px-3 py-2">
                  <Badge variant={conditionVariant(player.condition)} dot>
                    {conditionLabel(player.condition)}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-body-sm text-muted-foreground tabular-nums">
                  {money.format(player.base_value)}
                </td>
                <td className="px-3 py-2 text-body-sm-medium tabular-nums">{money.format(player.market_value)}</td>
                <td className="px-3 py-2">
                  {club ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-5 items-center rounded-sm border border-border bg-muted px-1 text-caption-xs-medium">
                        {club.acronym}
                      </span>
                      <span className="text-body-sm underline underline-offset-2">{club.name}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-body-sm text-muted-foreground">Livre</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => onBuy(player)}>
                        <ShoppingCart />
                        Comprar
                      </Button>
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <PlayerActionsMenu
                    player={player}
                    onDetails={() => onDetails(player)}
                    onEdit={() => onEdit(player)}
                    onCondition={() => onCondition(player)}
                    onBuy={() => onBuy(player)}
                    onDelete={() => onDelete(player)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!pending && players.length === 0 ? (
        <p className="px-3 py-6 text-body-sm text-muted-foreground">Nenhum jogador encontrado.</p>
      ) : null}
    </div>
  )
}

export { PlayersTable }
