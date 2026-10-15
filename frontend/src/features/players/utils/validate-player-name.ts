function validatePlayerName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ")
  if (
    normalized.length < 3 ||
    normalized.length > 100 ||
    /\d/.test(normalized) ||
    normalized.split(" ").length < 2
  ) {
    return "De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
  }
  return null
}

function normalizePlayerName(name: string) {
  return name.trim().replace(/\s+/g, " ")
}

export { normalizePlayerName, validatePlayerName }
