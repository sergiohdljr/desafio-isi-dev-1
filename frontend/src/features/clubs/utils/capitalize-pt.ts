function capitalizePt(value: string) {
  if (!value) return value
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1)
}

export { capitalizePt }
