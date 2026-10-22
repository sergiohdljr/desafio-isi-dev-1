import type { PlayerSort } from "@/features/players/types/player.types"

const PAGE_SIZE = 10
const AGE_MIN = 16
const AGE_MAX = 45

const SORTS: { value: PlayerSort; label: string }[] = [
  { value: "name", label: "nome" },
  { value: "value_desc", label: "maior valor de mercado" },
  { value: "value_asc", label: "menor valor de mercado" },
  { value: "age_desc", label: "maior idade" },
  { value: "age_asc", label: "menor idade" },
  { value: "position", label: "posição" },
]

const AVATAR_TONES = [
  "bg-avatar-violet text-avatar-violet-foreground",
  "bg-avatar-pink text-avatar-pink-foreground",
  "bg-avatar-cyan text-avatar-cyan-foreground",
  "bg-avatar-teal text-avatar-teal-foreground",
  "bg-avatar-zinc text-avatar-zinc-foreground",
]

const money = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export { AGE_MAX, AGE_MIN, AVATAR_TONES, PAGE_SIZE, SORTS, money }
