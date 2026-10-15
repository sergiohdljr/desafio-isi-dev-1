import { CONDITIONS, POSITIONS } from "@/features/players/consts/player-options"
import type { Condition, Position } from "@/features/players/types/player.types"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return `${first}${last}`.toLocaleUpperCase("pt-BR")
}

function positionLabel(position: Position) {
  return POSITIONS.find((item) => item.value === position)?.label ?? position
}

function conditionLabel(condition: Condition) {
  return CONDITIONS.find((item) => item.value === condition)?.label ?? condition
}

function agilityTone(value: number) {
  if (value >= 70) return "bg-chart-positive"
  if (value <= 30) return "bg-chart-negative"
  return "bg-muted-foreground"
}

export { agilityTone, conditionLabel, initials, positionLabel }
