import { HISTORY_TOTALS } from "@/features/clubs/consts/history"
import type { TransactionSummary } from "@/features/clubs/types/transactions.types"
import { profitTotalTone } from "@/features/clubs/utils/profit-total-tone"
import { money } from "@/features/players/consts/directory"
import { signedCoins } from "@/features/players/utils/signed-coins"

function HistorySummary({ summary }: { summary: TransactionSummary }) {
  return (
    <div className="grid grid-cols-5 border-t border-border bg-muted-subtle">
      {HISTORY_TOTALS.map((item) => {
        const Icon = item.icon
        const value = summary[item.key]
        return (
          <div key={item.key} className="flex flex-col gap-1 border-r border-border px-4 py-3.5 last:border-r-0">
            <p className="flex items-center gap-1.5 text-caption-xs text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              {item.label}
            </p>
            <p className={`text-heading-card tabular-nums ${profitTotalTone(item.key, value)}`}>
              {item.key === "total_profit" ? signedCoins(value) : money.format(value)}
            </p>
            <p className="text-caption-xs text-muted-foreground">{item.hint}</p>
          </div>
        )
      })}
    </div>
  )
}

export { HistorySummary }
