import type { Condition, Position } from "@/features/players/types/player.types"

const POSITIONS: { value: Position; label: string }[] = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "MEI", label: "Meio-campo" },
  { value: "ATA", label: "Atacante" },
]

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "APTO", label: "Apto" },
  { value: "MAL_CONDICIONADO", label: "Mal condicionado" },
  { value: "DOENTE", label: "Doente" },
]

export { CONDITIONS, POSITIONS }
