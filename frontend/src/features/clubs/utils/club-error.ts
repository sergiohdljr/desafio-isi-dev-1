import { NAME_TAKEN } from "@/features/clubs/consts/club-draft"
import type { ClubField } from "@/features/clubs/types/club.types"
import { normalizeClubName } from "@/features/clubs/utils/normalize-club"

function fieldForClubError(message: string): ClubField | null {
  const folded = message.toLocaleLowerCase("pt-BR")
  if (folded.includes("sigla")) return "acronym"
  if (folded.includes("nome")) return "name"
  return null
}

function clubErrorDescription(message: string, name: string) {
  if (message === NAME_TAKEN) {
    return `Já existe um clube com o nome “${normalizeClubName(name)}”.`
  }
  return message
}

export { clubErrorDescription, fieldForClubError }
