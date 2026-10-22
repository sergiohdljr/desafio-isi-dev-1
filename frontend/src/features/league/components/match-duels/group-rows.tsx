import { Goal } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ClubAcronym } from "@/features/league/components/club-acronym"
import { DUEL_ATTRIBUTE_LABELS } from "@/features/league/consts/match"
import type { DuelSide } from "@/features/league/types/match.types"
import { duelCaption } from "@/features/league/utils/duel-caption"
import type { MatchDuelGroup } from "@/features/league/utils/match-duel-groups"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import { initials } from "@/features/players/utils/player-display"

function GroupRows({ group }: { group: MatchDuelGroup }) {
  const goals = group.goals === 1 ? "1 gol" : `${group.goals} gols`
  return (
    <>
      <tr className="h-9 bg-muted-subtle">
        <td colSpan={5} className="px-4 text-caption-xs-medium">
          <ClubAcronym className="mr-2">{group.acronym}</ClubAcronym>
          {group.title}
        </td>
        <td className="pr-4 text-right text-caption-xs-medium text-muted-foreground">{goals}</td>
      </tr>
      {group.duels.map((duel) => (
        <tr key={duel.order} className="h-[60px] border-b border-border last:border-b-0">
          <td className="pr-2 pl-4">
            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-caption-xs-medium">{duel.order}</span>
          </td>
          <td className="px-2">
            <PlayerCell
              player={duel.attacker}
              caption={duelCaption(duel.order, "attacker", duel.attacker.position, group.clubName)}
            />
          </td>
          <td className="px-2">
            <AttributeValue attribute={DUEL_ATTRIBUTE_LABELS[duel.attacker.attribute]} value={duel.attacker.value} />
          </td>
          <td className="px-2">
            <PlayerCell
              player={duel.defender}
              caption={duelCaption(duel.order, "defender", duel.defender.position, group.opponentName)}
            />
          </td>
          <td className="px-2">
            <AttributeValue attribute={DUEL_ATTRIBUTE_LABELS[duel.defender.attribute]} value={duel.defender.value} />
          </td>
          <td className="pr-4 pl-2">
            {duel.goal ? (
              <Badge variant="success" icon={<Goal />}>
                Gol
              </Badge>
            ) : (
              <Badge variant="outline">Sem gol</Badge>
            )}
          </td>
        </tr>
      ))}
    </>
  )
}

function PlayerCell({ player, caption }: { player: DuelSide; caption: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <Avatar
        initials={initials(player.player_name)}
        className={AVATAR_TONES[player.player_id % AVATAR_TONES.length]}
      />
      <span className="min-w-0">
        <span className="block text-body-sm-medium">{player.player_name}</span>
        <span className="block text-caption-xs text-muted-foreground">{caption}</span>
      </span>
    </span>
  )
}

function AttributeValue({ attribute, value }: { attribute: string; value: number }) {
  return (
    <span className="text-body-sm tabular-nums">
      <span className="text-muted-foreground">{attribute}</span> <span className="font-semibold">{value}</span>
    </span>
  )
}

export { GroupRows }
