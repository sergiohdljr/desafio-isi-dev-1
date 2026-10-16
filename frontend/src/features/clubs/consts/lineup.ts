import formation31 from "@/assets/formations/3-1.svg"
import formation22 from "@/assets/formations/2-2.svg"
import formation211 from "@/assets/formations/2-1-1.svg"
import formation121 from "@/assets/formations/1-2-1.svg"
import type { Formation, LineupSlot } from "@/features/clubs/types/lineup.types"

const STARTER_COUNT = 5
const DEFAULT_FORMATION: Formation = "2-1-1"
const LINE_PLAYERS_NEEDED = 4

const FORMATIONS: { value: Formation; note: string; diagram: string }[] = [
  { value: "3-1", note: "Defesa 3, ataque 1", diagram: formation31 },
  { value: "2-2", note: "Defesa 2, ataque 2", diagram: formation22 },
  { value: "2-1-1", note: "Defesa 2, meio 1, ataque 1", diagram: formation211 },
  { value: "1-2-1", note: "Defesa 1, meio 2, ataque 1", diagram: formation121 },
]

const SLOTS: Record<Formation, LineupSlot[]> = {
  "3-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-2": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-1-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "1-2-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
}

const PITCH: Record<Formation, { top: string; left: string }[]> = {
  "3-1": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "18%" },
    { top: "52%", left: "50%" },
    { top: "52%", left: "82%" },
    { top: "16%", left: "50%" },
  ],
  "2-2": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "30%" },
    { top: "52%", left: "70%" },
    { top: "18%", left: "30%" },
    { top: "18%", left: "70%" },
  ],
  "2-1-1": [
    { top: "84%", left: "50%" },
    { top: "66%", left: "28%" },
    { top: "66%", left: "72%" },
    { top: "46%", left: "50%" },
    { top: "22%", left: "50%" },
  ],
  "1-2-1": [
    { top: "78%", left: "50%" },
    { top: "56%", left: "50%" },
    { top: "36%", left: "28%" },
    { top: "36%", left: "72%" },
    { top: "14%", left: "50%" },
  ],
}

export { DEFAULT_FORMATION, FORMATIONS, LINE_PLAYERS_NEEDED, PITCH, SLOTS, STARTER_COUNT }
