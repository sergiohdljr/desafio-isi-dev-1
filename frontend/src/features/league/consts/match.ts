import type { Formation } from "@/features/clubs/types/lineup.types"
import type { Position } from "@/features/players/types/player.types"

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

const PITCH_COLUMNS: Record<Formation, { position: Position | "DEF"; top: string }[][]> = {
  "3-1": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "22%" },
      { position: "DEF", top: "46%" },
      { position: "DEF", top: "70%" },
    ],
    [{ position: "ATA", top: "46%" }],
  ],
  "2-2": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "28%" },
      { position: "DEF", top: "64%" },
    ],
    [
      { position: "ATA", top: "28%" },
      { position: "ATA", top: "64%" },
    ],
  ],
  "2-1-1": [
    [{ position: "GOL", top: "46%" }],
    [
      { position: "DEF", top: "28%" },
      { position: "DEF", top: "64%" },
    ],
    [{ position: "MEI", top: "46%" }],
    [{ position: "ATA", top: "46%" }],
  ],
  "1-2-1": [
    [{ position: "GOL", top: "46%" }],
    [{ position: "DEF", top: "46%" }],
    [
      { position: "MEI", top: "28%" },
      { position: "MEI", top: "64%" },
    ],
    [{ position: "ATA", top: "46%" }],
  ],
}

const HOME_LEFT = ["8%", "18%", "30%", "40%"]
const AWAY_LEFT = ["92%", "82%", "70%", "60%"]

export { AWAY_LEFT, DUEL_ATTRIBUTE_LABELS, DUEL_ATTRIBUTES, HOME_LEFT, MATCH_RESULTS, PITCH_COLUMNS, RESULT_LABELS }
