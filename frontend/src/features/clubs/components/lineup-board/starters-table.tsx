import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SLOTS } from "@/features/clubs/consts/lineup"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Formation } from "@/features/clubs/types/lineup.types"
import { slotFits } from "@/features/clubs/utils/slot-fits"
import { usedAttributes } from "@/features/clubs/utils/used-attributes"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { conditionLabel } from "@/features/players/utils/player-display"

function StartersTable({
  formation,
  chosen,
  squad,
  starters,
  onSelect,
}: {
  formation: Formation
  chosen: (SquadPlayer | null)[]
  squad: SquadPlayer[]
  starters: (number | null)[]
  onSelect: (index: number, player: SquadPlayer) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
          <tr className="h-10 bg-muted-subtle">
            <th className="pr-2 pl-4 font-medium">Vaga</th>
            <th className="px-2 font-medium">Titular</th>
            <th className="w-[160px] px-2 font-medium">Condição</th>
            <th className="w-[80px] px-2 font-medium">Overall</th>
            <th className="pr-4 pl-2 font-medium">Atributos usados</th>
          </tr>
        </thead>
        <tbody>
          {SLOTS[formation].map((slot, index) => {
            const player = chosen[index]
            const options = squad.filter(
              (item) => slotFits(slot.kind, item.position) && (item.id === player?.id || !starters.includes(item.id)),
            )
            return (
              <tr key={`${slot.kind}-${index}`} className="h-[60px] border-b border-border last:border-b-0">
                <td className="pr-2 pl-4">
                  <span className="block text-body-sm-medium">{slot.label}</span>
                  <span className="block text-caption-xs text-muted-foreground">{slot.hint}</span>
                </td>
                <td className="px-2">
                  <Select
                    value={player ? String(player.id) : null}
                    onValueChange={(value) => {
                      if (!value) return
                      const next = squad.find((item) => item.id === Number(value))
                      if (!next) return
                      onSelect(index, next)
                    }}
                  >
                    <SelectTrigger className="w-full max-w-[240px]" aria-label={slot.label}>
                      <SelectValue placeholder={options.length === 0 ? `Sem ${slot.hint}` : "Escolher"}>
                        {player
                          ? `${player.name} (${player.position})`
                          : options.length === 0
                            ? `Sem ${slot.hint}`
                            : "Escolher"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name} ({option.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2">
                  {player ? (
                    <Badge variant={conditionVariant(player.condition)} dot>
                      {conditionLabel(player.condition)}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-2 text-body-sm-semibold tabular-nums">{player?.overall ?? ""}</td>
                <td className="pr-4 pl-2 text-body-sm text-muted-foreground">{player ? usedAttributes(player) : ""}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export { StartersTable }
