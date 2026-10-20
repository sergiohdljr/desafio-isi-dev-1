import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { Plus, Swords } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { listMatches } from "@/features/league/api/league.api"
import { LatestMatch, MatchesHistory } from "@/features/league/components/matches-history"
import { NewMatchDialog } from "@/features/league/components/new-match-dialog"
import { clubAcronym } from "@/features/league/utils/club-acronym"
import { Button } from "@/components/ui/button"
import { ResourceEmpty, ResourceError } from "@/components/ui/resource-state"

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
  const error =
    matches.error instanceof Error
      ? matches.error.message
      : matches.error
        ? "Não foi possível carregar as partidas."
        : null
  const acronym = (id: number, name: string) => clubAcronym(clubs, id, name)

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
      {error ? (
        <ResourceError
          title="Não foi possível carregar as partidas"
          description={error}
          onRetry={() => void queryClient.invalidateQueries({ queryKey: ["matches"] })}
        />
      ) : null}
      {latest ? (
        <LatestMatch
          match={latest}
          homeAcronym={acronym(latest.home.club_id, latest.home.club_name)}
          awayAcronym={acronym(latest.away.club_id, latest.away.club_name)}
        />
      ) : null}
      {error ? null : (
        <MatchesHistory
          rows={rows}
          clubs={clubs}
          clubId={clubId}
          pending={matches.isPending}
          empty={
            <ResourceEmpty
              framed={false}
              title="Nenhuma partida jogada"
              description="Escale os titulares de dois clubes e jogue a primeira partida."
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => setCreating(true)}>
                  Nova partida
                </Button>
              }
            />
          }
          acronym={acronym}
          onClubIdChange={setClubId}
        />
      )}
      <p className="text-caption-xs text-muted-foreground">
        Vitória vale 3 pontos e empate vale 1. A classificação usa pontos, saldo, gols e nome.
      </p>
      {creating ? (
        <NewMatchDialog
          clubs={clubs}
          onClose={() => setCreating(false)}
          onPlayed={(match) => {
            setCreating(false)
            void queryClient.invalidateQueries({ queryKey: ["matches"] })
            void queryClient.invalidateQueries({ queryKey: ["standings"] })
            void navigate(paths.match(match.id), { state: { played: true } })
          }}
        />
      ) : null}
    </main>
  )
}

export { MatchesPage }
