import type { ReactNode } from "react"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

function SummaryCard({
  className,
  label,
  value,
  unit = "moedas",
  note,
  icon,
}: {
  className?: string
  label: string
  value: string
  unit?: string
  note?: string
  icon?: ReactNode
}) {
  return (
    <article
      data-slot="summary-card"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-body-sm-medium text-muted-foreground">{label}</p>
        <span className="text-muted-foreground" aria-hidden>
          {icon ?? <Wallet className="size-4" />}
        </span>
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-display-kpi tabular-nums">{value}</span>
        {unit ? <span className="text-body-sm text-muted-foreground">{unit}</span> : null}
      </p>
      {note ? <p className="text-caption-xs text-muted-foreground">{note}</p> : null}
    </article>
  )
}

export { SummaryCard }
