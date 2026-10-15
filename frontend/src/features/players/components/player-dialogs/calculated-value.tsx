import { Lock } from "lucide-react"

function CalculatedValue({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm-medium text-muted-foreground">{label}</span>
      <div className="flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-3 text-body-sm text-muted-foreground">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        Após salvar
      </div>
      <span className="text-caption-xs text-muted-foreground">{hint}</span>
    </div>
  )
}

export { CalculatedValue }
