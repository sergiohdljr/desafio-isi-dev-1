function optionalInteger(value: string, min: number, max: number) {
  if (!value.trim()) return undefined
  if (!/^\d+$/.test(value.trim())) return undefined
  const number = Number(value)
  if (number < min || number > max) return undefined
  return number
}

function optionalMoney(value: string) {
  const normalized = value.trim().replace(",", ".")
  if (!normalized) return undefined
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return undefined
  return Number(normalized)
}

export { optionalInteger, optionalMoney }
