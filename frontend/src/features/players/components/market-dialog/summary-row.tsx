import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

function SummaryRow({
  label,
  hint,
  value,
  emphasis = false,
  last = false,
  valueClassName,
}: {
  label: string
  hint?: string
  value: ReactNode
  emphasis?: boolean
  last?: boolean
  valueClassName?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-2.5",
        !last && "border-b border-border",
        emphasis && "bg-muted-subtle",
      )}
    >
      <dt>
        <span className={emphasis ? "text-body-sm-semibold" : "text-muted-foreground"}>{label}</span>
        {hint ? <span className="block text-caption-xs text-muted-foreground">{hint}</span> : null}
      </dt>
      <dd
        className={cn(emphasis ? "text-heading-card tabular-nums" : "text-body-sm-medium tabular-nums", valueClassName)}
      >
        {value}
      </dd>
    </div>
  )
}

export { SummaryRow }
