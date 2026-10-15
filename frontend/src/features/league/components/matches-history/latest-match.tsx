import { useNavigate } from "react-router"
import { paths } from "@/app/routes"
import { Scoreboard } from "@/features/league/components/scoreboard"
import type { MatchSummary } from "@/features/league/types/match.types"
import { Button } from "@/components/ui/button"

function LatestMatch({
  match,
  homeAcronym,
  awayAcronym,
}: {
  match: MatchSummary
  homeAcronym: string
  awayAcronym: string
}) {
  const navigate = useNavigate()
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-sm-medium">Última partida</h2>
      <div className="relative">
        <Scoreboard match={match} homeAcronym={homeAcronym} awayAcronym={awayAcronym} />
        <Button
          type="button"
          variant="outline"
          className="absolute top-1/2 right-6 -translate-y-1/2"
          onClick={() => navigate(paths.match(match.id))}
        >
          Ver duelos
        </Button>
      </div>
    </section>
  )
}

export { LatestMatch }
