import { Escudo } from "@/components/ui/escudo"
import { Badge } from "@/components/ui/badge"
import type { MatchSummary } from "@/features/league/api/league.api"

function resultLabel(result: MatchSummary["result"]) {
  if (result === "MANDANTE") return "Vitória do mandante"
  if (result === "VISITANTE") return "Vitória do visitante"
  return "Empate"
}

function resultVariant(result: MatchSummary["result"]) {
  if (result === "EMPATE") return "secondary" as const
  return "success" as const
}

function Scoreboard({
  match,
  homeAcronym,
  awayAcronym,
}: {
  match: MatchSummary
  homeAcronym: string
  awayAcronym: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-[12px] border border-border bg-card px-6 py-5 shadow-xs">
      <div className="flex items-center justify-end gap-3 text-right">
        <div>
          <p className="text-heading-card">{match.home.club_name}</p>
          <p className="text-caption-xs text-muted-foreground">Mandante · {match.home.formation}</p>
        </div>
        <Escudo sigla={homeAcronym} size="lg" />
      </div>
      <div className="flex w-36 flex-col items-center gap-1 px-4">
        <p className="text-heading-page tabular-nums">{match.home.goals} × {match.away.goals}</p>
        <p className="text-caption-xs text-muted-foreground">{formatPlayedAt(match.played_at)}</p>
        <Badge variant={resultVariant(match.result)}>{resultLabel(match.result)}</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Escudo sigla={awayAcronym} size="lg" />
        <div>
          <p className="text-heading-card">{match.away.club_name}</p>
          <p className="text-caption-xs text-muted-foreground">Visitante · {match.away.formation}</p>
        </div>
      </div>
    </div>
  )
}

function formatPlayedAt(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}, ${match[4]}:${match[5]}`
}

function splitPlayedAt(value: string) {
  const formatted = formatPlayedAt(value)
  const [date, time] = formatted.split(", ")
  return { date: date ?? formatted, time: time ?? "" }
}

export { Scoreboard, formatPlayedAt, resultLabel, resultVariant, splitPlayedAt }
