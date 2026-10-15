import { useNavigate } from "react-router"
import { paths } from "@/app/routes"
import type { Club } from "@/features/clubs/types/club.types"
import { ClubAcronym } from "@/features/league/components/club-acronym"
import type { MatchSummary } from "@/features/league/types/match.types"
import { resultLabel, resultVariant } from "@/features/league/utils/match-result-display"
import { splitPlayedAt } from "@/features/league/utils/played-at"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function MatchesHistory({
  rows,
  clubs,
  clubId,
  pending,
  acronym,
  onClubIdChange,
}: {
  rows: MatchSummary[]
  clubs: Club[]
  clubId: string
  pending: boolean
  acronym: (clubId: number, name: string) => string
  onClubIdChange: (clubId: string) => void
}) {
  const navigate = useNavigate()
  return (
    <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-heading-card">Histórico de partidas</h2>
          <p className="text-caption-xs text-muted-foreground">Da mais recente para a mais antiga, com o placar.</p>
        </div>
        <Select value={clubId || null} onValueChange={(value) => onClubIdChange(!value || value === "all" ? "" : value)}>
          <SelectTrigger className="w-auto" aria-label="Filtrar por clube">
            <SelectValue placeholder="Todos os clubes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clubes</SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club.id} value={String(club.id)}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>
      {rows.length === 0 && !pending ? (
        <p className="px-4 py-10 text-center text-body-sm text-muted-foreground">Nenhuma partida ainda.</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
            <tr className="h-10 bg-muted-subtle">
              <th className="pr-2 pl-4 font-medium">Data e hora</th>
              <th className="px-2 text-right font-medium">Mandante</th>
              <th className="px-2 text-center font-medium">Placar</th>
              <th className="px-2 font-medium">Visitante</th>
              <th className="px-2 font-medium">Resultado</th>
              <th className="pr-4 pl-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((match) => {
              const when = splitPlayedAt(match.played_at)
              return (
                <tr key={match.id} className="h-14 border-b border-border last:border-b-0">
                  <td className="pr-2 pl-4 text-body-sm tabular-nums">
                    {when.date} <span className="text-muted-foreground">{when.time}</span>
                  </td>
                  <td className="px-2 text-right text-body-sm-medium">
                    {match.home.club_name}{" "}
                    <ClubAcronym className="mx-1">{acronym(match.home.club_id, match.home.club_name)}</ClubAcronym>
                  </td>
                  <td className="px-2 text-center">
                    <span className="inline-flex rounded-md bg-muted px-2.5 py-0.5 text-body-sm-medium tabular-nums">
                      {match.home.goals} × {match.away.goals}
                    </span>
                  </td>
                  <td className="px-2 text-body-sm-medium">
                    <ClubAcronym className="mx-1">{acronym(match.away.club_id, match.away.club_name)}</ClubAcronym>{" "}
                    {match.away.club_name}
                  </td>
                  <td className="px-2">
                    <Badge variant={resultVariant(match.result)}>{resultLabel(match.result)}</Badge>
                  </td>
                  <td className="pr-4 pl-2 text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate(paths.match(match.id))}>
                      Ver duelos
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <footer className="border-t border-border px-4 py-3 text-body-sm text-muted-foreground">{rows.length} partidas</footer>
    </section>
  )
}

export { MatchesHistory }
