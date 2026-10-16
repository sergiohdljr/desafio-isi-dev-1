import {
  ACRONYM_LENGTH,
  INVALID_ACRONYM,
  INVALID_NAME,
  NAME_MAX_LENGTH,
  NAME_MAX_WORDS,
  NAME_MIN_LENGTH,
  NAME_MIN_WORDS,
} from "@/features/clubs/consts/club-draft"
import type { ClubDraft, ClubDraftIssue } from "@/features/clubs/types/club.types"
import { foldAccents, normalizeAcronym, normalizeClubName } from "@/features/clubs/utils/normalize-club"

function validateClubDraft(draft: ClubDraft): ClubDraftIssue | null {
  const name = normalizeClubName(draft.name)
  if (!isClubName(name)) return { field: "name", message: INVALID_NAME }

  const acronym = normalizeAcronym(draft.acronym)
  if (!acronymFitsName(name, acronym)) return { field: "acronym", message: INVALID_ACRONYM }

  return null
}

function isClubName(value: string) {
  const length = Array.from(value).length
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) return false
  if (hasControlCharacter(value)) return false
  if (!Array.from(value).every(isClubNameCharacter)) return false

  const words = value.split(" ")
  return words.length >= NAME_MIN_WORDS && words.length <= NAME_MAX_WORDS && words.every((word) => /\p{L}/u.test(word))
}

function acronymFitsName(name: string, acronym: string) {
  if (!/^[A-Z]{3}$/.test(acronym)) return false
  if (acronym[0] === acronym[1] && acronym[1] === acronym[2]) return false

  const letters = Array.from(foldAccents(name).toUpperCase()).filter((character) => /^\p{L}$/u.test(character))
  if (letters[0] !== acronym[0]) return false

  let matched = 0
  for (const letter of letters) {
    if (letter === acronym[matched]) matched += 1
    if (matched === ACRONYM_LENGTH) return true
  }
  return false
}

function isClubNameCharacter(character: string) {
  return character === " " || character === "-" || character === "." || /^\p{L}$/u.test(character)
}

function hasControlCharacter(value: string) {
  return /\p{Cc}/u.test(value)
}

export { acronymFitsName, isClubName, validateClubDraft }
