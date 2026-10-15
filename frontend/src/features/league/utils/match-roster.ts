import type { DuelSide, Match, MatchDuel } from "@/features/league/types/match.types"
import type { Player, Position } from "@/features/players/types/player.types"

function roster(match: Match, clubId: number, lineup: Player[]) {
  const byId = new Map<number, Player>()
  for (const duel of match.duels) {
    for (const side of [duel.attacker, duel.defender]) {
      if (!sideAppearsFor(duel, side, clubId)) continue
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

function sideAppearsFor(duel: MatchDuel, side: DuelSide, clubId: number) {
  if (side === duel.attacker) return duel.attacking_club_id === clubId
  return duel.attacking_club_id !== clubId
}

function blankPlayer(side: DuelSide): Player {
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

export { blankPlayer, roster, sideAppearsFor }
