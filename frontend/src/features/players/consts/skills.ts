const SKILLS = [
  { key: "pace", label: "Velocidade" },
  { key: "shooting", label: "Finalização" },
  { key: "passing", label: "Passe" },
  { key: "dribbling", label: "Drible" },
  { key: "defending", label: "Defesa" },
  { key: "physical", label: "Físico" },
] as const

const SKILL_SCALE = 99
const SKILLS_SUM_MAX = 480

type SkillKey = (typeof SKILLS)[number]["key"]

export type { SkillKey }
export { SKILLS, SKILL_SCALE, SKILLS_SUM_MAX }
