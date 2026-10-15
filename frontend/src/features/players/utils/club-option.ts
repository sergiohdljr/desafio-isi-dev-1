import type { Club } from "@/features/clubs/types/club.types"
import { money } from "@/features/players/consts/directory"

function clubOption(club: Club) {
  return `${club.name} (${club.acronym}) · caixa ${money.format(club.cash)}`
}

export { clubOption }
