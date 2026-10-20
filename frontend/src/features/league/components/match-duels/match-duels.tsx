import { GroupRows } from "@/features/league/components/match-duels/group-rows"
import type { Match } from "@/features/league/types/match.types"
import { matchDuelGroups } from "@/features/league/utils/match-duel-groups"

function MatchDuels({ match, acronym }: { match: Match; acronym: (clubId: number, name: string) => string }) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-heading-card">Duelos</h2>
        <p className="text-caption-xs text-muted-foreground">
          Os 3 ataques do mandante e depois os 3 do visitante. É gol só quando o ataque é maior.
        </p>
      </header>
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
          <tr className="h-10 bg-muted-subtle">
            <th className="pr-2 pl-4 font-medium">Duelo</th>
            <th className="px-2 font-medium">Atacante</th>
            <th className="px-2 font-medium">Ataque</th>
            <th className="px-2 font-medium">Defensor</th>
            <th className="px-2 font-medium">Defesa</th>
            <th className="pr-4 pl-2 font-medium">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {matchDuelGroups(match, acronym).map((group) => (
            <GroupRows key={group.title} group={group} />
          ))}
        </tbody>
      </table>
    </section>
  )
}

export { MatchDuels }
