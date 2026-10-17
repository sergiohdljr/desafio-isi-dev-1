import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { ListOrdered, Plus } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { listMatches, listStandings } from "@/features/league/api/league.api"
import { ClubAcronym } from "@/features/league/components/club-acronym"
import { NewMatchDialog } from "@/features/league/components/new-match-dialog"
import { clubAcronym } from "@/features/league/utils/club-acronym"
import { formatPlayedAt } from "@/features/league/utils/played-at"
import { Button } from "@/components/ui/button"
import { ResourceEmpty, ResourceError, ResourceLoading } from "@/components/ui/resource-state"

const CRITERIA = ["Mais pontos", "Maior saldo de gols", "Mais gols marcados", "Nome do clube, de A a Z"]

function StandingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clubs } = useClubs("name")
  const [creating, setCreating] = useState(false)
  const table = useQuery({ queryKey: ["standings"], queryFn: listStandings })
  const matches = useQuery({ queryKey: ["matches", ""], queryFn: () => listMatches() })
  useAppChrome({
    crumbs: [{ label: "Liga" }, { label: "Classificação" }],
    onRefresh: () => {
      void queryClient.invalidateQueries({ queryKey: ["standings"] })
      void queryClient.invalidateQueries({ queryKey: ["matches"] })
    },
  })
  const error =
    table.error instanceof Error
      ? table.error.message
      : table.error
        ? "Não foi possível carregar a classificação."
        : null

  const acronym = (id: number, name: string) => clubAcronym(clubs, id, name)

  return (
    <main className="flex flex-1 flex-col gap-6 px-8 pt-7 pb-10">
      <div className="flex items-center gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
          <ListOrdered className="size-[22px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-page">Classificação</h1>
          <p className="text-body-sm text-muted-foreground">Um item por clube, inclusive quem ainda não jogou.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus /> Nova partida
        </Button>
      </div>
      {error ? (
        <ResourceError
          title="Não foi possível carregar a classificação"
          description={error}
          onRetry={() => void queryClient.invalidateQueries({ queryKey: ["standings"] })}
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
          {table.isPending ? (
            <ResourceLoading />
          ) : (table.data ?? []).length === 0 ? (
            <ResourceEmpty
              title="Nenhum clube cadastrado"
              description="A classificação mostra todos os clubes, mesmo os que ainda não jogaram."
            />
          ) : (
            <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
                  <tr className="h-10 bg-muted-subtle">
                    {["#", "Clube", "J", "V", "E", "D", "GP", "GC", "SG", "Pts"].map((label) => (
                      <th
                        key={label}
                        className={label === "Clube" ? "px-2 text-left font-medium" : "px-2 text-right font-medium"}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(table.data ?? []).map((row) => (
                    <tr key={row.club_id} className="h-[52px] border-b border-border last:border-b-0">
                      <td className="pl-4 text-right">
                        <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-caption-xs-medium">
                          {row.position}
                        </span>
                      </td>
                      <td className="px-2">
                        <button
                          type="button"
                          className="text-body-sm-medium hover:underline"
                          onClick={() => navigate(paths.club(row.club_id))}
                        >
                          <ClubAcronym className="mr-2">{acronym(row.club_id, row.club_name)}</ClubAcronym>
                          {row.club_name}
                        </button>
                      </td>
                      {[
                        row.played,
                        row.wins,
                        row.draws,
                        row.losses,
                        row.goals_for,
                        row.goals_against,
                        row.goal_difference,
                        row.points,
                      ].map((value, index) => (
                        <td key={index} className="px-2 text-right text-body-sm tabular-nums">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <footer className="border-t border-border px-4 py-3 text-caption-xs text-muted-foreground">
                J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols pró · GC: gols contra · SG: saldo · Pts:
                pontos
              </footer>
            </section>
          )}
          <aside className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-heading-card">Últimas partidas</h2>
                <p className="text-caption-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
              </header>
              <ul>
                {(matches.data ?? []).slice(0, 3).map((match) => (
                  <li key={match.id} className="border-b border-border px-5 py-3 last:border-b-0">
                    <p className="text-caption-xs text-muted-foreground">{formatPlayedAt(match.played_at)}</p>
                    <button
                      type="button"
                      className="text-body-sm-medium hover:underline"
                      onClick={() => navigate(paths.match(match.id))}
                    >
                      {match.home.club_name} {match.home.goals} × {match.away.goals} {match.away.club_name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-[12px] border border-border bg-card px-5 py-4 shadow-xs">
              <h2 className="text-heading-card">Ordem da tabela</h2>
              <p className="text-caption-xs text-muted-foreground">Critérios usados pela API, nesta ordem.</p>
              <ol className="mt-3 flex flex-col gap-2">
                {CRITERIA.map((item, index) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-caption-xs-medium">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      )}
      {creating ? (
        <NewMatchDialog
          clubs={clubs}
          onClose={() => setCreating(false)}
          onPlayed={(match) => {
            setCreating(false)
            void queryClient.invalidateQueries({ queryKey: ["matches"] })
            void queryClient.invalidateQueries({ queryKey: ["standings"] })
            void navigate(paths.match(match.id))
          }}
        />
      ) : null}
    </main>
  )
}

export { StandingsPage }
