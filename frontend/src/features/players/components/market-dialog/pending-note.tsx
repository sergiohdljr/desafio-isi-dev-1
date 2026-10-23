import { Info } from "lucide-react"

function PendingNote({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-border bg-muted-subtle px-3 py-2 text-caption-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  )
}

export { PendingNote }
