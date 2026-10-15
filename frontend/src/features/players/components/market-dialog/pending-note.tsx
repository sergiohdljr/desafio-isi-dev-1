import { Info } from "lucide-react"

function PendingNote({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-caption-xs text-muted-foreground">
      <Info className="size-3.5" aria-hidden />
      {children}
    </p>
  )
}

export { PendingNote }
