function normalizeClubName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizeAcronym(value: string) {
  return value.trim().toUpperCase()
}

function foldAccents(value: string) {
  return value.normalize("NFD").replace(/\p{Mn}/gu, "")
}

export { foldAccents, normalizeAcronym, normalizeClubName }
