import { money } from "@/features/players/consts/directory"

function signedCoins(value: number) {
  const formatted = money.format(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

export { signedCoins }
