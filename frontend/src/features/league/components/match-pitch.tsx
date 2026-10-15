import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, HeartPulse } from "lucide-react"
import { getLineup } from "@/features/clubs/api/clubs.api"
import type { Formation } from "@/features/clubs/types/lineup.types"
import type { Player, Position } from "@/features/players/types/player.types"
import { initials } from "@/features/players/utils/player-display"
import type { Match } from "@/features/league/api/league.api"

const COLUMNS: Record<Formation, { position: Position | "DEF"; top: string }[][]> = {
  "3-1": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "22%" },
      { position: "DEF", top: "46%" },
      { position: "DEF", top: "70%" },
    ],
    [{ position: "ATA", top: "46%" }],
  ],
  "2-2": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "28%" },
      { position: "DEF", top: "64%" },
    ],
    [
      { position: "ATA", top: "28%" },
      { position: "ATA", top: "64%" },
    ],
  ],
  "2-1-1": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "28%" },
      { position: "DEF", top: "64%" },
    ],
    [{ position: "MEI", top: "46%" }],
    [{ position: "ATA", top: "46%" }],
  ],
  "1-2-1": [
    [{ position: "GOL", top: "46%" }],
    [{ position: "DEF", top: "46%" }],
    [
      { position: "MEI", top: "28%" },
      { position: "MEI", top: "64%" },
    ],
    [{ position: "ATA", top: "46%" }],
  ],
}

const HOME_LEFT = ["8%", "18%", "30%", "40%"]
const AWAY_LEFT = ["92%", "82%", "70%", "60%"]

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
          <svg className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)]" viewBox="0 0 1022 392" fill="none" aria-hidden>
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
          <Side
            formation={match.home.formation}
            players={homePlayers}
            side="home"
            scorers={scorers}
          />
          <Side
            formation={match.away.formation}
            players={awayPlayers}
            side="away"
            scorers={scorers}
          />
        </div>
      </div>
    </section>
  )
}

function Side({
  formation,
  players,
  side,
  scorers,
}: {
  formation: Formation
  players: Player[]
  side: "home" | "away"
  scorers: Set<number>
}) {
  const remaining = [...players]
  const columns = COLUMNS[formation]
  const lefts = side === "home" ? HOME_LEFT : AWAY_LEFT
  return (
    <>
      {columns.map((column, columnIndex) =>
        column.map((slot) => {
          const index = remaining.findIndex((player) => fits(slot.position, player.position))
          if (index < 0) return null
          const [player] = remaining.splice(index, 1)
          return (
            <PlayerMark
              key={player.id}
              player={player}
              top={slot.top}
              left={lefts[columnIndex] ?? lefts[lefts.length - 1]}
              home={side === "home"}
              scored={scorers.has(player.id)}
            />
          )
        }),
      )}
    </>
  )
}

function PlayerMark({
  player,
  top,
  left,
  home,
  scored,
}: {
  player: Player
  top: string
  left: string
  home: boolean
  scored: boolean
}) {
  return (
    <span className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2" style={{ top, left }}>
      <span
        className={
          home
            ? "relative inline-flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-body-sm-medium text-primary-foreground shadow-md"
            : "relative inline-flex size-9 items-center justify-center rounded-full border-2 border-background bg-background text-body-sm-medium text-foreground shadow-md"
        }
      >
        {initials(player.name)}
        {player.condition === "MAL_CONDICIONADO" ? (
          <span className="absolute -top-1.5 -left-1.5 inline-flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-background bg-warning text-white">
            <HeartPulse className="size-2.5" aria-hidden />
          </span>
        ) : null}
        {scored ? (
          <span className="absolute -top-1.5 left-6">
            <Ball />
          </span>
        ) : null}
      </span>
      <span className="flex flex-col items-center gap-0.5">
        <span className="rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium whitespace-nowrap text-pitch-foreground">{player.name}</span>
        <span className="rounded-full bg-black/30 px-1.5 text-caption-xs whitespace-nowrap text-pitch-muted-foreground">
          {player.position} · {attributeLine(player)}
        </span>
      </span>
    </span>
  )
}

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

function Ball() {
  return <span className="inline-block size-4 rounded-full border border-foreground bg-background shadow-sm" aria-hidden />
}

function roster(match: Match, clubId: number, lineup: Player[]) {
  const byId = new Map<number, Player>()
  for (const duel of match.duels) {
    for (const side of [duel.attacker, duel.defender]) {
      const played = sideAppearsFor(duel, side, clubId)
      if (!played) continue
      const current = byId.get(side.player_id)
      const known = lineup.find((player) => player.id === side.player_id)
      const base = current ?? known ?? blankPlayer(side)
      byId.set(side.player_id, {
        ...base,
        shooting: side.attribute === "shooting" ? side.value : base.shooting,
        passing: side.attribute === "passing" ? side.value : base.passing,
        dribbling: side.attribute === "dribbling" ? side.value : base.dribbling,
        defending: side.attribute === "defending" ? side.value : base.defending,
        condition: side.condition,
      })
    }
  }
  return [...byId.values()]
}

function sideAppearsFor(duel: Match["duels"][number], side: Match["duels"][number]["attacker"], clubId: number) {
  if (side === duel.attacker) return duel.attacking_club_id === clubId
  return duel.attacking_club_id !== clubId
}

function blankPlayer(side: Match["duels"][number]["attacker"]): Player {
  return {
    id: side.player_id,
    name: side.player_name,
    position: side.position as Position,
    condition: side.condition,
    age: 0,
    agility: 0,
    pace: 0,
    shooting: 0,
    passing: 0,
    dribbling: 0,
    defending: 0,
    physical: 0,
    overall: 0,
    potential: 0,
    base_value: 0,
    market_value: 0,
    club_id: null,
  }
}

function fits(slot: Position | "DEF", position: Position) {
  if (slot === "DEF") return position === "ZAG" || position === "LAT"
  return position === slot
}

function attributeLine(player: Player) {
  if (player.position === "ATA") return `Fin ${player.shooting}`
  if (player.position === "MEI") return `Pas ${player.passing}`
  if (player.position === "LAT") return `Dri ${player.dribbling} · Def ${player.defending}`
  return `Def ${player.defending}`
}

export { MatchPitch }
