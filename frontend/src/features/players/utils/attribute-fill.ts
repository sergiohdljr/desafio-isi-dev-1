import { SKILL_SCALE } from "@/features/players/consts/skills"

function attributeFill(value: number | null) {
  if (value === null || value < 1) return 0
  return Math.min(100, (value / SKILL_SCALE) * 100)
}

export { attributeFill }
