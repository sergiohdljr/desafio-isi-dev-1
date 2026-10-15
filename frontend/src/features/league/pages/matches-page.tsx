import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { Plus, Swords } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { listMatches } from "@/features/league/api/league.api"
import { NewMatchDialog } from "@/features/league/components/new-match-dialog"
import { Scoreboard } from "@/features/league/components/scoreboard"
import { resultLabel, resultVariant } from "@/features/league/utils/match-result-display"
import { splitPlayedAt } from "@/features/league/utils/played-at"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function MatchesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clubs } = useClubs("name")
  const [clubId, setClubId] = useState("")
  const [creating, setCreating] = useState(false)
  const matches = useQuery({
    queryKey: ["matches", clubId],
    queryFn: () => listMatches(clubId ? Number(clubId) : undefined),
  })
  useAppChrome({
    crumbs: [{ label: "Liga" }, { label: "Partidas" }],
    onRefresh: () => queryClient.invalidateQueries({ queryKey: ["matches"] }),
  })
  const rows = matches.data ?? []
  const latest = clubId ? null : rows[0]
  const error = matches.error instanceof Error ? matches.error.message : matches.error ? "Não foi possível carregar as partidas." : null

  function acronym(id: number, name: string) {
    return clubs.find((club) => club.id === id)?.acronym ?? name.slice(0, 3).toUpperCase()
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-8 pt-7 pb-10">
      <div className="flex items-center gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
          <Swords className="size-[22px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-page">Partidas</h1>
          <p className="text-body-sm text-muted-foreground">O placar sai dos duelos entre os titulares, sem sorteio.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus /> Nova partida
        </Button>
      </div>
      {error ? <Alert variant="destructive" title="Filtro recusado" description={error} /> : null}
      {latest ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-body-sm-medium">Última partida</h2>
          <div className="relative">
            <Scoreboard match={latest} homeAcronym={acronym(latest.home.club_id, latest.home.club_name)} awayAcronym={acronym(latest.away.club_id, latest.away.club_name)} />
            <Button type="button" variant="outline" className="absolute top-1/2 right-6 -translate-y-1/2" onClick={() => navigate(paths.match(latest.id))}>
              Ver duelos
            </Button>
          </div>
        </section>
      ) : null}
      <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
        <header className="flex items-center gap-4 border-b border-border px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-heading-card">Histórico de partidas</h2>
            <p className="text-caption-xs text-muted-foreground">Da mais recente para a mais antiga, com o placar.</p>
          </div>
          <Select value={clubId || null} onValueChange={(value) => setClubId(!value || value === "all" ? "" : value)}>
            <SelectTrigger className="w-auto" aria-label="Filtrar por clube">
              <SelectValue placeholder="Todos os clubes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clubes</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={String(club.id)}>{club.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>
        {rows.length === 0 && !matches.isPending ? (
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
                    <td className="pr-2 pl-4 text-body-sm tabular-nums">{when.date} <span className="text-muted-foreground">{when.time}</span></td>
                    <td className="px-2 text-right text-body-sm-medium">
                      {match.home.club_name} <Acronym>{acronym(match.home.club_id, match.home.club_name)}</Acronym>
                    </td>
                    <td className="px-2 text-center">
                      <span className="inline-flex rounded-md bg-muted px-2.5 py-0.5 text-body-sm-medium tabular-nums">{match.home.goals} × {match.away.goals}</span>
                    </td>
                    <td className="px-2 text-body-sm-medium">
                      <Acronym>{acronym(match.away.club_id, match.away.club_name)}</Acronym> {match.away.club_name}
                    </td>
                    <td className="px-2"><Badge variant={resultVariant(match.result)}>{resultLabel(match.result)}</Badge></td>
                    <td className="pr-4 pl-2 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => navigate(paths.match(match.id))}>Ver duelos</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <footer className="border-t border-border px-4 py-3 text-body-sm text-muted-foreground">{rows.length} partidas</footer>
      </section>
      <p className="text-caption-xs text-muted-foreground">Vitória vale 3 pontos e empate vale 1. A classificação usa pontos, saldo, gols e nome.</p>
      {creating ? (
        <NewMatchDialog
          clubs={clubs}
          onClose={() => setCreating(false)}
          onPlayed={(match) => {
            setCreating(false)
            void queryClient.invalidateQueries({ queryKey: ["matches"] })
            void queryClient.invalidateQueries({ queryKey: ["standings"] })
            navigate(paths.match(match.id))
          }}
        />
      ) : null}
    </main>
  )
}

function Acronym({ children }: { children: string }) {
  return <span className="mx-1 inline-flex rounded-md border border-border px-1 text-caption-xs-medium">{children}</span>
}

export { MatchesPage }
