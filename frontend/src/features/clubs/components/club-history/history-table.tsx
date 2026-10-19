import { HandCoins, ShoppingCart } from "lucide-react"
import type { ClubTransaction } from "@/features/clubs/types/transactions.types"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AVATAR_TONES, money } from "@/features/players/consts/directory"
import { splitLoyalty } from "@/features/players/utils/format-loyalty"
import { initials } from "@/features/players/utils/player-display"
import { signedCoins } from "@/features/players/utils/signed-coins"

function HistoryTable({ rows }: { rows: ClubTransaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
          <tr className="h-10 bg-muted-subtle">
            <th className="pr-2 pl-4 font-medium">Data e hora</th>
            <th className="px-2 font-medium">Tipo</th>
            <th className="px-2 font-medium">Jogador</th>
            <th className="px-2 text-right font-medium">Valor</th>
            <th className="px-2 text-right font-medium">Taxa ou comissão</th>
            <th className="px-2 text-right font-medium">Multa</th>
            <th className="px-2 text-right font-medium">Lucro</th>
            <th className="pr-4 pl-2 text-right font-medium">Variação do caixa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const when = splitLoyalty(row.created_at)
            return (
              <tr key={row.id} className="h-[52px] border-b border-border last:border-b-0">
                <td className="pr-2 pl-4 text-body-sm tabular-nums">
                  {when.date} <span className="text-muted-foreground">{when.time}</span>
                </td>
                <td className="px-2">
                  <Badge
                    variant={row.type === "COMPRA" ? "outline" : "secondary"}
                    icon={row.type === "COMPRA" ? <ShoppingCart /> : <HandCoins />}
                  >
                    {row.type === "COMPRA" ? "Compra" : "Venda"}
                  </Badge>
                </td>
                <td className="px-2">
                  <span className="flex items-center gap-2.5">
                    <Avatar
                      initials={initials(row.player_name)}
                      className={AVATAR_TONES[row.player_id % AVATAR_TONES.length]}
                    />
                    <span className="text-body-sm-medium">{row.player_name}</span>
                  </span>
                </td>
                <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.value)}</td>
                <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.fee)}</td>
                <td className="px-2 text-right text-body-sm tabular-nums">{money.format(row.penalty)}</td>
                <td className={`px-2 text-right text-body-sm tabular-nums ${profitTone(row)}`}>
                  {row.type === "COMPRA" ? "–" : signedCoins(row.profit)}
                </td>
                <td
                  className={`pr-4 pl-2 text-right text-body-sm-semibold tabular-nums ${signedTone(row.cash_change)}`}
                >
                  {signedCoins(row.cash_change)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function profitTone(row: ClubTransaction) {
  if (row.type === "COMPRA") return "text-muted-foreground"
  return signedTone(row.profit)
}

function signedTone(value: number) {
  if (value > 0) return "text-success"
  if (value < 0) return "text-destructive"
  return "text-muted-foreground"
}

export { HistoryTable }
