const MATCH_RESULTS = ["MANDANTE", "VISITANTE", "EMPATE"] as const
const DUEL_ATTRIBUTES = ["shooting", "passing", "dribbling", "defending"] as const

const RESULT_LABELS = {
  MANDANTE: "Vitória do mandante",
  VISITANTE: "Vitória do visitante",
  EMPATE: "Empate",
} as const satisfies Record<(typeof MATCH_RESULTS)[number], string>

const DUEL_ATTRIBUTE_LABELS = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
} as const satisfies Record<(typeof DUEL_ATTRIBUTES)[number], string>

export { DUEL_ATTRIBUTE_LABELS, DUEL_ATTRIBUTES, MATCH_RESULTS, RESULT_LABELS }
