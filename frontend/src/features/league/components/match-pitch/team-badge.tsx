import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Formation } from "@/features/clubs/types/lineup.types"

function TeamBadge({ name, formation, side }: { name: string; formation: Formation; side: "home" | "away" }) {
  return (
    <span
      className={
        side === "home"
          ? "absolute top-9 left-9 flex items-center gap-1.5 rounded-full bg-pitch-label py-1 pr-2.5 pl-2 text-caption-xs-medium text-pitch-foreground"
          : "absolute top-9 right-9 flex items-center gap-1.5 rounded-full bg-pitch-label py-1 pr-2.5 pl-2 text-caption-xs-medium text-pitch-foreground"
      }
    >
      <span className={side === "home" ? "size-2.5 rounded-full bg-primary" : "size-2.5 rounded-full bg-background"} />
      {name}
      <span className="text-pitch-muted-foreground">{formation}</span>
      <span className="h-3 w-px bg-pitch-line" />
      <span className="font-normal text-pitch-muted-foreground">ataca</span>
      {side === "home" ? <ArrowRight className="size-3" aria-hidden /> : <ArrowLeft className="size-3" aria-hidden />}
    </span>
  )
}

export { TeamBadge }
