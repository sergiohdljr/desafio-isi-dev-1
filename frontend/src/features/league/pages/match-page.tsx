import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { getMatch } from "@/features/league/api/league.api"
import { MatchDuels } from "@/features/league/components/match-duels"
import { MatchPitch } from "@/features/league/components/match-pitch"
import { Scoreboard } from "@/features/league/components/scoreboard"
import { clubAcronym } from "@/features/league/utils/club-acronym"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function MatchPage() {
  const navigate = useNavigate()
  const params = useParams()
  const id = Number(params.id)
  const { clubs } = useClubs("name")
  const match = useQuery({
    queryKey: ["matches", "detail", id],
    queryFn: () => getMatch(id),
    enabled: Number.isInteger(id) && id > 0,
  })
  useAppChrome({
    crumbs: [
      { label: "Liga" },
      { label: "Partidas", to: paths.matches },
      { label: match.data ? `${match.data.home.club_name} × ${match.data.away.club_name}` : "Partida" },
    ],
    onRefresh: () => match.refetch(),
  })
  const error =
    match.error instanceof Error ? match.error.message : match.error ? "Não foi possível carregar a partida." : null
  const data = match.data
  const acronym = (clubId: number, name: string) => clubAcronym(clubs, clubId, name)

  return (
    <main className="flex flex-1 flex-col gap-6 px-8 pt-7 pb-10">
      <Button type="button" variant="ghost" className="w-fit" onClick={() => navigate(paths.matches)}>
        <ArrowLeft /> Voltar para partidas
      </Button>
      {error ? <Alert variant="destructive" description={error} /> : null}
      {data ? (
        <>
          <Scoreboard
            match={data}
            homeAcronym={acronym(data.home.club_id, data.home.club_name)}
            awayAcronym={acronym(data.away.club_id, data.away.club_name)}
          />
          <MatchPitch match={data} />
          <MatchDuels match={data} acronym={acronym} />
        </>
      ) : null}
    </main>
  )
}

export { MatchPage }
