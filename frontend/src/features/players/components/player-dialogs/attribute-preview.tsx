import { ChartBar } from "lucide-react"
import { attributeFill } from "@/features/players/utils/attribute-fill"

function AttributePreview({
  values,
  potential,
}: {
  values: { label: string; value: number | null }[]
  potential: number | null
}) {
  const potentialLabel = potential === null ? "—" : String(potential)
  return (
    <aside className="flex w-61 shrink-0 flex-col gap-2.5 rounded-xl border bg-muted-subtle p-3">
      <p className="flex items-center gap-1.5 text-caption-xs-medium text-muted-foreground">
        <ChartBar className="size-3.5" aria-hidden="true" />
        Prévia dos atributos
      </p>
      {values.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-17.5 shrink-0 text-caption-xs text-muted-foreground">{item.label}</span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
              style={{ width: `${attributeFill(potential)}%` }}
            />
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${attributeFill(item.value)}%` }}
            />
          </span>
          <span className="w-5 text-right text-caption-xs-medium tabular-nums">
            {item.value === null ? "—" : item.value}
          </span>
        </div>
      ))}
      <p className="text-caption-xs text-muted-foreground">
        Faixa clara: até o potencial ({potentialLabel}). A prévia só desenha os valores digitados; não calcula overall
        nem valor base.
      </p>
    </aside>
  )
}

export { AttributePreview }
