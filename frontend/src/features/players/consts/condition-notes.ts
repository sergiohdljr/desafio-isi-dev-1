import type { Condition } from "@/features/players/types/player.types"

const CONDITION_NOTES: Record<Condition, string> = {
  APTO: "Sem desconto por condição.",
  MAL_CONDICIONADO: "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  DOENTE: "Desconto de 30%, com o mesmo ajuste de agilidade.",
}

export { CONDITION_NOTES }
