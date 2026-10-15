import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { getMatch } from "@/features/league/api/league.api"
import type { DuelAttribute, Match } from "@/features/league/types/match.types"
import { MatchPitch } from "@/features/league/components/match-pitch"
import { Scoreboard } from "@/features/league/components/scoreboard"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ATTRIBUTES: Record<DuelAttribute, string> = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
}

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
  const error = match.error instanceof Error ? match.error.message : match.error ? "Não foi possível carregar a partida." : null
  const data = match.data

  function acronym(clubId: number, name: string) {
    return clubs.find((club) => club.id === clubId)?.acronym ?? name.slice(0, 3).toUpperCase()
  }

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
          <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-heading-card">Duelos</h2>
              <p className="text-caption-xs text-muted-foreground">Os 3 ataques do mandante e depois os 3 do visitante. É gol só quando o ataque é maior.</p>
            </header>
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
                <tr className="h-10 bg-muted-subtle">
                  <th className="pr-2 pl-4 font-medium">Ordem</th>
                  <th className="px-2 font-medium">Atacante</th>
                  <th className="px-2 font-medium">Ataque</th>
                  <th className="px-2 font-medium">Defensor</th>
                  <th className="px-2 font-medium">Defesa</th>
                  <th className="pr-4 pl-2 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {groups(data, acronym).map((group) => (
                  <GroupRows key={group.title} group={group} />
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </main>
  )
}

function groups(match: Match, acronym: (clubId: number, name: string) => string) {
  const home = match.duels.filter((duel) => duel.attacking_club_id === match.home.club_id)
  const away = match.duels.filter((duel) => duel.attacking_club_id === match.away.club_id)
  return [
    { title: `Ataques do ${match.home.club_name} (mandante)`, acronym: acronym(match.home.club_id, match.home.club_name), goals: home.filter((duel) => duel.goal).length, duels: home },
    { title: `Ataques do ${match.away.club_name} (visitante)`, acronym: acronym(match.away.club_id, match.away.club_name), goals: away.filter((duel) => duel.goal).length, duels: away },
  ]
}

function GroupRows({ group }: { group: ReturnType<typeof groups>[number] }) {
  return (
    <>
      <tr className="h-9 bg-muted-subtle">
        <td colSpan={5} className="px-4 text-caption-xs-medium">
          <span className="mr-2 inline-flex rounded-md border border-border px-1">{group.acronym}</span>
          {group.title}
        </td>
        <td className="pr-4 text-right text-caption-xs text-muted-foreground">{group.goals} gols</td>
      </tr>
      {group.duels.map((duel) => (
        <tr key={duel.order} className="h-[60px] border-b border-border">
          <td className="pr-2 pl-4 text-body-sm-medium">{duel.order}º</td>
          <td className="px-2 text-body-sm-medium">{duel.attacker.player_name}</td>
          <td className="px-2 text-body-sm tabular-nums">{ATTRIBUTES[duel.attacker.attribute]} {duel.attacker.value}</td>
          <td className="px-2 text-body-sm-medium">{duel.defender.player_name}</td>
          <td className="px-2 text-body-sm tabular-nums">{ATTRIBUTES[duel.defender.attribute]} {duel.defender.value}</td>
          <td className="pr-4 pl-2">
            <Badge variant={duel.goal ? "success" : "secondary"}>{duel.goal ? "Gol" : "Defendido"}</Badge>
          </td>
        </tr>
      ))}
    </>
  )
}

export { MatchPage }
