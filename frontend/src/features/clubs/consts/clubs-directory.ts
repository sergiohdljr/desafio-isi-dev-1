import type { ClubSort } from "@/features/clubs/types/club.types"

const MAX_CLUBS = 20
const DEFAULT_CLUB_SORT: ClubSort = "net_worth_desc"

const CLUB_SORT_OPTIONS: { value: ClubSort; label: string }[] = [
  { value: "name", label: "nome" },
  { value: "net_worth_desc", label: "patrimônio (maior para o menor)" },
  { value: "net_worth_asc", label: "patrimônio (menor para o maior)" },
]

const CLUBS_CRUMBS = [{ label: "Mercado" }, { label: "Clubes" }]

export { CLUB_SORT_OPTIONS, CLUBS_CRUMBS, DEFAULT_CLUB_SORT, MAX_CLUBS }
