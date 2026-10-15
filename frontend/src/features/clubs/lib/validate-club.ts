const NAME_MIN_LENGTH = 3
const NAME_MAX_LENGTH = 60
const NAME_MIN_WORDS = 2
const NAME_MAX_WORDS = 5
const ACRONYM_LENGTH = 3

const INVALID_NAME = "Nome inválido"
const INVALID_ACRONYM = "Sigla inválida"
const NAME_TAKEN = "Nome de clube já cadastrado"

type ClubField = "name" | "acronym"

type ClubDraft = {
  name: string
  acronym: string
}

type ClubDraftIssue = {
  field: ClubField
  message: string
}

function normalizeClubName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizeAcronym(value: string) {
  return value.trim().toUpperCase()
}

function validateClubDraft(draft: ClubDraft): ClubDraftIssue | null {
  const name = normalizeClubName(draft.name)
  if (!isClubName(name)) return { field: "name", message: INVALID_NAME }

  const acronym = normalizeAcronym(draft.acronym)
  if (!acronymFitsName(name, acronym)) return { field: "acronym", message: INVALID_ACRONYM }

  return null
}

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

function isClubName(value: string) {
  const length = Array.from(value).length
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) return false
  if (hasControlCharacter(value)) return false
  if (!Array.from(value).every(isClubNameCharacter)) return false

  const words = value.split(" ")
  return (
    words.length >= NAME_MIN_WORDS &&
    words.length <= NAME_MAX_WORDS &&
    words.every((word) => /\p{L}/u.test(word))
  )
}

function acronymFitsName(name: string, acronym: string) {
  if (!/^[A-Z]{3}$/.test(acronym)) return false
  if (acronym[0] === acronym[1] && acronym[1] === acronym[2]) return false

  const letters = Array.from(foldAccents(name).toUpperCase()).filter((character) =>
    /^\p{L}$/u.test(character),
  )
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

function foldAccents(value: string) {
  return value.normalize("NFD").replace(/\p{Mn}/gu, "")
}

export type { ClubDraft, ClubDraftIssue, ClubField }
export { clubErrorDescription, fieldForClubError, normalizeAcronym, normalizeClubName, validateClubDraft }
