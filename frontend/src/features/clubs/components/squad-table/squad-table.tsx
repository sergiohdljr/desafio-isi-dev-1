import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tag } from "lucide-react"
import { getLineup } from "@/features/clubs/api/clubs.api"
import { PenaltyBadge } from "@/features/clubs/components/squad-table/penalty-badge"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import { penaltyRateFor } from "@/features/clubs/utils/penalty-rate"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SellPlayerDialog } from "@/features/players/components/sell-player-dialog"
import { AVATAR_TONES, money } from "@/features/players/consts/directory"
import { conditionVariant } from "@/features/players/utils/condition-variant"
import { splitLoyalty } from "@/features/players/utils/format-loyalty"
import { conditionLabel, initials } from "@/features/players/utils/player-display"

function SquadTable({
  players,
  clubId,
  clubName,
  onSold,
  onViewHistory,
}: {
  players: SquadPlayer[]
  clubId: number
  clubName: string
  onSold: () => Promise<unknown>
  onViewHistory: () => void
}) {
  const [target, setTarget] = useState<SquadPlayer | null>(null)
  const lineup = useQuery({
    queryKey: ["clubs", "lineup", clubId],
    queryFn: () => getLineup(clubId),
  })
  const starter = target ? (lineup.data?.players.some((item) => item.id === target.id) ?? false) : false

  return (
    <section className="w-full overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <header className="flex flex-col gap-1 border-b border-border px-4 py-4">
        <h2 className="text-body-sm-semibold">Elenco</h2>
        <p className="text-caption-xs text-muted-foreground">
          Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para uma venda agora.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
            <tr className="h-10 bg-muted-subtle">
              <th className="pr-2 pl-4 font-medium">Jogador</th>
              <th className="w-[90px] px-2 font-medium">Posição</th>
              <th className="w-[80px] px-2 font-medium">Overall</th>
              <th className="w-[160px] px-2 font-medium">Condição</th>
              <th className="w-[120px] px-2 text-right font-medium">Valor de mercado</th>
              <th className="w-[120px] px-2 text-right font-medium">Valor de compra</th>
              <th className="w-[130px] px-2 font-medium">Fim da fidelidade</th>
              <th className="w-[110px] px-2 text-right font-medium">Dias restantes</th>
              <th className="w-[116px] px-2 font-medium">% de multa</th>
              <th className="w-[120px] pr-4 pl-2" />
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const loyalty = splitLoyalty(player.contract.loyalty_until)
              const rate = penaltyRateFor(player.contract.remaining_days)
              return (
                <tr key={player.id} className="h-[60px] border-b border-border last:border-b-0">
                  <td className="pr-2 pl-4">
                    <span className="flex items-center gap-3">
                      <Avatar
                        initials={initials(player.name)}
                        className={AVATAR_TONES[player.id % AVATAR_TONES.length]}
                      />
                      <span className="text-body-sm-medium">{player.name}</span>
                    </span>
                  </td>
                  <td className="px-2">
                    <Badge variant="outline">{player.position}</Badge>
                  </td>
                  <td className="px-2 text-body-sm-semibold tabular-nums">{player.overall}</td>
                  <td className="px-2">
                    <Badge variant={conditionVariant(player.condition)} dot>
                      {conditionLabel(player.condition)}
                    </Badge>
                  </td>
                  <td className="px-2 text-right text-body-sm tabular-nums">{money.format(player.market_value)}</td>
                  <td className="px-2 text-right text-body-sm tabular-nums">
                    {money.format(player.contract.purchase_value)}
                  </td>
                  <td className="px-2 text-body-sm">
                    <span className="block tabular-nums">{loyalty.date}</span>
                    <span className="block text-caption-xs text-muted-foreground tabular-nums">{loyalty.time}</span>
                  </td>
                  <td className="px-2 text-right text-body-sm tabular-nums">{player.contract.remaining_days}</td>
                  <td className="px-2">
                    <PenaltyBadge rate={rate} />
                  </td>
                  <td className="pr-4 pl-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 px-3!"
                      onClick={() => setTarget(player)}
                    >
                      <Tag className="size-3.5" />
                      Vender
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-3 text-caption-xs text-muted-foreground">
        Valor de mercado, dias restantes e % de multa calculados para uma venda agora. A multa tem teto de 10,00.
      </p>
      {target ? (
        <SellPlayerDialog
          player={target}
          clubName={clubName}
          starter={starter}
          onClose={() => setTarget(null)}
          onSold={onSold}
          onViewHistory={() => {
            setTarget(null)
            onViewHistory()
          }}
        />
      ) : null}
    </section>
  )
}

export { SquadTable }
