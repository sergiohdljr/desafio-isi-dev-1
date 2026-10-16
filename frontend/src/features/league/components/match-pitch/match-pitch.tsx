import { useQuery } from "@tanstack/react-query"
import { HeartPulse } from "lucide-react"
import { getLineup } from "@/features/clubs/api/clubs.api"
import { Ball } from "@/features/league/components/match-pitch/ball"
import { Side } from "@/features/league/components/match-pitch/side"
import { TeamBadge } from "@/features/league/components/match-pitch/team-badge"
import type { Match } from "@/features/league/types/match.types"
import { roster } from "@/features/league/utils/match-roster"

function MatchPitch({ match }: { match: Match }) {
  const home = useQuery({
    queryKey: ["clubs", "lineup", match.home.club_id],
    queryFn: () => getLineup(match.home.club_id),
  })
  const away = useQuery({
    queryKey: ["clubs", "lineup", match.away.club_id],
    queryFn: () => getLineup(match.away.club_id),
  })
  const scorers = new Set(match.duels.filter((duel) => duel.goal).map((duel) => duel.attacker.player_id))
  const homePlayers = roster(match, match.home.club_id, home.data?.players ?? [])
  const awayPlayers = roster(match, match.away.club_id, away.data?.players ?? [])

  return (
    <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-heading-card">Em campo</h2>
          <p className="text-caption-xs text-muted-foreground">
            Titulares de cada clube na formação da partida e o atributo usado no duelo.
          </p>
        </div>
        <p className="flex items-center gap-4 text-caption-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-warning text-white">
              <HeartPulse className="size-2.5" aria-hidden />
            </span>
            Mal condicionado
          </span>
          <span className="flex items-center gap-1.5">
            <Ball />
            Gol no duelo
          </span>
        </p>
      </header>
      <div className="p-5">
        <div className="relative h-[440px] overflow-hidden rounded-xl bg-pitch">
          <span className="absolute inset-y-0 left-[7%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[21%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[35%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[49%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[63%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[77%] w-[7%] bg-pitch-stripe" />
          <span className="absolute inset-y-0 left-[91%] w-[7%] bg-pitch-stripe" />
          <svg
            className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)]"
            viewBox="0 0 1022 392"
            fill="none"
            aria-hidden
          >
            <rect x="1" y="1" width="1020" height="390" stroke="white" strokeOpacity="0.75" />
            <line x1="511" y1="1" x2="511" y2="391" stroke="white" strokeOpacity="0.75" />
            <circle cx="511" cy="196" r="52" stroke="white" strokeOpacity="0.75" />
            <circle cx="511" cy="196" r="2.5" fill="white" fillOpacity="0.75" />
            <rect x="1" y="86" width="150" height="220" stroke="white" strokeOpacity="0.75" />
            <rect x="1" y="146" width="70" height="100" stroke="white" strokeOpacity="0.75" />
            <rect x="871" y="86" width="150" height="220" stroke="white" strokeOpacity="0.75" />
            <rect x="951" y="146" width="70" height="100" stroke="white" strokeOpacity="0.75" />
          </svg>
          <TeamBadge name={match.home.club_name} formation={match.home.formation} side="home" />
          <TeamBadge name={match.away.club_name} formation={match.away.formation} side="away" />
          <Side formation={match.home.formation} players={homePlayers} side="home" scorers={scorers} />
          <Side formation={match.away.formation} players={awayPlayers} side="away" scorers={scorers} />
        </div>
      </div>
    </section>
  )
}

export { MatchPitch }
