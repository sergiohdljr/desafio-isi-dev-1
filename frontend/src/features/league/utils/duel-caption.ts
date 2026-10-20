function duelCaption(order: number, role: "attacker" | "defender", position: string, clubName: string) {
  const wave = (order - 1) % 3
  if (role === "defender" && wave === 0) return `Goleiro · ${clubName}`
  const line = role === "attacker" ? 4 - wave : wave
  return `${position}, ${line}º de linha · ${clubName}`
}

export { duelCaption }
