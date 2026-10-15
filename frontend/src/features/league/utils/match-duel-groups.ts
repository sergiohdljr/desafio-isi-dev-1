import type { Match, MatchDuel } from "@/features/league/types/match.types"

type MatchDuelGroup = {
  title: string
  acronym: string
  goals: number
  duels: MatchDuel[]
}

function matchDuelGroups(match: Match, acronym: (clubId: number, name: string) => string): MatchDuelGroup[] {
  const home = match.duels.filter((duel) => duel.attacking_club_id === match.home.club_id)
  const away = match.duels.filter((duel) => duel.attacking_club_id === match.away.club_id)
  return [
    {
      title: `Ataques do ${match.home.club_name} (mandante)`,
      acronym: acronym(match.home.club_id, match.home.club_name),
      goals: home.filter((duel) => duel.goal).length,
      duels: home,
    },
    {
      title: `Ataques do ${match.away.club_name} (visitante)`,
      acronym: acronym(match.away.club_id, match.away.club_name),
      goals: away.filter((duel) => duel.goal).length,
      duels: away,
    },
  ]
}

export type { MatchDuelGroup }
export { matchDuelGroups }
