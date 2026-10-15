function foldName(value: string) {
  return value.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase()
}

function normalizeSearch(value: string) {
  return foldName(value.trim().replace(/\s+/g, " "))
}

function compareNames(left: string, right: string) {
  const foldedLeft = foldName(left)
  const foldedRight = foldName(right)
  if (foldedLeft < foldedRight) return -1
  if (foldedLeft > foldedRight) return 1
  return 0
}

export { compareNames, foldName, normalizeSearch }
