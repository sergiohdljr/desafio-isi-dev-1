import { Badge } from "@/components/ui/badge"
import { ClubAcronym } from "@/features/league/components/club-acronym"
import { DUEL_ATTRIBUTE_LABELS } from "@/features/league/consts/match"
import type { MatchDuelGroup } from "@/features/league/utils/match-duel-groups"

function GroupRows({ group }: { group: MatchDuelGroup }) {
  return (
    <>
      <tr className="h-9 bg-muted-subtle">
        <td colSpan={5} className="px-4 text-caption-xs-medium">
          <ClubAcronym className="mr-2">{group.acronym}</ClubAcronym>
          {group.title}
        </td>
        <td className="pr-4 text-right text-caption-xs text-muted-foreground">{group.goals} gols</td>
      </tr>
      {group.duels.map((duel) => (
        <tr key={duel.order} className="h-[60px] border-b border-border">
          <td className="pr-2 pl-4 text-body-sm-medium">{duel.order}º</td>
          <td className="px-2 text-body-sm-medium">{duel.attacker.player_name}</td>
          <td className="px-2 text-body-sm tabular-nums">
            {DUEL_ATTRIBUTE_LABELS[duel.attacker.attribute]} {duel.attacker.value}
          </td>
          <td className="px-2 text-body-sm-medium">{duel.defender.player_name}</td>
          <td className="px-2 text-body-sm tabular-nums">
            {DUEL_ATTRIBUTE_LABELS[duel.defender.attribute]} {duel.defender.value}
          </td>
          <td className="pr-4 pl-2">
            <Badge variant={duel.goal ? "success" : "secondary"}>{duel.goal ? "Gol" : "Defendido"}</Badge>
          </td>
        </tr>
      ))}
    </>
  )
}

export { GroupRows }
