function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) return null
  return Number(value)
}

export { parseInteger }
