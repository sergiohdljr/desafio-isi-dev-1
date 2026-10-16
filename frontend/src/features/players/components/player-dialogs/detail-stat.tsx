import type { ReactNode } from "react"

function DetailStat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3.5 py-3">
      <div className="flex items-center justify-between text-caption-xs-medium text-muted-foreground">
        {label}
        {icon}
      </div>
      <p className="text-display-kpi">{value}</p>
      <p className="text-caption-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export { DetailStat }
