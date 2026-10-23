import type { Player } from "@/features/players/types/player.types"

type PlayersDialog =
  | { type: "create" }
  | { type: "created"; player: Player }
  | { type: "edit"; player: Player }
  | { type: "condition"; player: Player }
  | { type: "delete"; player: Player }
  | { type: "details"; player: Player }
  | { type: "buy"; player: Player }

type PlayersNotice = {
  variant: "success" | "error"
  title: string
  description?: string
}

type ActiveFilter = {
  id: string
  label: string
  clear: () => void
}

export type { ActiveFilter, PlayersDialog, PlayersNotice }
