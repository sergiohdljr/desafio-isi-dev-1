import { Info } from "lucide-react"

function RulesNote({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-caption-xs text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}

export { RulesNote }
