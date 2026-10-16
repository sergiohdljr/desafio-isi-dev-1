import { useState, type FormEvent } from "react"
import { Info, UserRound } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogClose } from "@/features/players/components/market-dialog/index"
import { AttributePreview } from "@/features/players/components/player-dialogs/attribute-preview"
import { CalculatedValue } from "@/features/players/components/player-dialogs/calculated-value"
import { Hint } from "@/features/players/components/player-dialogs/hint"
import { PositionChoices } from "@/features/players/components/player-dialogs/position-choices"
import { AGE_MAX, AGE_MIN } from "@/features/players/consts/directory"
import { SKILLS, SKILLS_SUM_MAX, type SkillKey } from "@/features/players/consts/skills"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"
import type { Position } from "@/features/players/types/player.types"
import { parseInteger } from "@/features/players/utils/parse-integer"
import { normalizePlayerName, validatePlayerName } from "@/features/players/utils/validate-player-name"

function CreatePlayerDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: {
    name: string
    position: Position
    age: number
    agility: number
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
    potential: number
  }) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [position, setPosition] = useState<Position | "">("")
  const [age, setAge] = useState("")
  const [agility, setAgility] = useState("")
  const [skills, setSkills] = useState<Record<SkillKey, string>>({
    pace: "",
    shooting: "",
    passing: "",
    dribbling: "",
    defending: "",
    physical: "",
  })
  const [potential, setPotential] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { ref, titleId } = useModalDialog()
  const potentialNumber = parseInteger(potential)
  const previewValues = SKILLS.map((skill) => ({
    label: skill.label,
    value: parseInteger(skills[skill.key]),
  }))
  const firstSkills = SKILLS.slice(0, 4)
  const secondSkills = SKILLS.slice(4)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    const nameError = validatePlayerName(name)
    if (nameError) next.name = nameError
    if (!position) next.position = "Escolha uma posição."
    const ageNumber = parseInteger(age)
    if (ageNumber === null || ageNumber < AGE_MIN || ageNumber > AGE_MAX) {
      next.age = `De ${AGE_MIN} a ${AGE_MAX} anos.`
    }
    const agilityNumber = parseInteger(agility)
    const agilityMax = ageNumber !== null && ageNumber >= 35 ? 85 : 100
    if (agilityNumber === null || agilityNumber < 1 || agilityNumber > agilityMax) {
      next.agility = "De 1 a 100 (até 85 com 35 anos ou mais)."
    }
    const skillNumbers = {} as Record<SkillKey, number>
    for (const skill of SKILLS) {
      const value = parseInteger(skills[skill.key])
      if (value === null || value < 1 || value > 99) {
        next[skill.key] = "Use um valor de 1 a 99."
      } else {
        skillNumbers[skill.key] = value
      }
    }
    const potentialValue = parseInteger(potential)
    if (potentialValue === null) next.potential = "Informe o potencial."
    else if (potentialValue < 1 || potentialValue > 99) {
      next.potential = "Use um valor de 1 a 99."
    }
    const skillValues = Object.values(skillNumbers)
    if (skillValues.length === SKILLS.length) {
      if (skillValues.reduce((sum, value) => sum + value, 0) > SKILLS_SUM_MAX) {
        next.skills = `A soma dos indicadores não pode passar de ${SKILLS_SUM_MAX}.`
      }
      const best = Math.max(...skillValues)
      if (potentialValue !== null && potentialValue < best) {
        next.potential = "O potencial não pode ser menor que o maior indicador."
      }
      if (ageNumber !== null && ageNumber >= 33 && potentialValue !== null && potentialValue !== best) {
        next.potential = "A partir dos 33 anos o potencial é igual ao maior indicador."
      }
    }
    setErrors(next)
    if (
      Object.keys(next).length > 0 ||
      !position ||
      ageNumber === null ||
      agilityNumber === null ||
      potentialValue === null
    ) {
      setFormError("Corrija os campos destacados para salvar.")
      return
    }
    setFormError(null)
    setPending(true)
    try {
      await onSubmit({
        name: normalizePlayerName(name),
        position,
        age: ageNumber,
        agility: agilityNumber,
        potential: potentialValue,
        ...skillNumbers,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o jogador.")
    } finally {
      setPending(false)
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-h-none max-w-213 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Novo jogador
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao
          salvar.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <label className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Nome</span>
          <span className="relative">
            <UserRound
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={name}
              placeholder="Davi Melo"
              className="pl-9"
              aria-invalid={Boolean(errors.name)}
              onChange={(event) => setName(event.target.value)}
            />
          </span>
          <Hint error={errors.name}>De 3 a 100 caracteres, com pelo menos duas palavras e sem números.</Hint>
        </label>
        <div className="flex flex-col gap-2" aria-invalid={Boolean(errors.position)}>
          <span className="text-body-sm-medium">Posição</span>
          <PositionChoices value={position} onChange={setPosition} />
          {errors.position ? <span className="text-caption-xs text-destructive">{errors.position}</span> : null}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Idade</span>
            <Input
              value={age}
              inputMode="numeric"
              placeholder="23"
              aria-invalid={Boolean(errors.age)}
              onChange={(event) => setAge(event.target.value)}
            />
            <Hint error={errors.age}>{`De ${AGE_MIN} a ${AGE_MAX} anos.`}</Hint>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Agilidade</span>
            <Input
              value={agility}
              inputMode="numeric"
              placeholder="70"
              aria-invalid={Boolean(errors.agility)}
              onChange={(event) => setAgility(event.target.value)}
            />
            <Hint error={errors.agility}>De 1 a 100 (até 85 com 35 anos ou mais).</Hint>
          </label>
          <CalculatedValue label="Valor base (moedas)" hint="Calculado no cadastro." />
        </div>
        <div className="h-px bg-border" />
        <div className="flex flex-col gap-0.5">
          <h3 className="text-heading-card">Indicadores técnicos</h3>
          <p className="text-body-sm text-muted-foreground">
            Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis atributos não pode
            passar de {SKILLS_SUM_MAX}.
          </p>
          {errors.skills ? <p className="text-caption-xs text-destructive">{errors.skills}</p> : null}
        </div>
        <div className="flex items-start gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="grid grid-cols-4 gap-3">
              {firstSkills.map((skill) => (
                <label key={skill.key} className="flex flex-col gap-2">
                  <span className="text-body-sm-medium">{skill.label}</span>
                  <Input
                    value={skills[skill.key]}
                    inputMode="numeric"
                    aria-invalid={Boolean(errors[skill.key])}
                    onChange={(event) => setSkills((current) => ({ ...current, [skill.key]: event.target.value }))}
                  />
                  {errors[skill.key] ? (
                    <span className="text-caption-xs text-destructive">{errors[skill.key]}</span>
                  ) : null}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {secondSkills.map((skill) => (
                <label key={skill.key} className="flex flex-col gap-2">
                  <span className="text-body-sm-medium">{skill.label}</span>
                  <Input
                    value={skills[skill.key]}
                    inputMode="numeric"
                    aria-invalid={Boolean(errors[skill.key])}
                    onChange={(event) => setSkills((current) => ({ ...current, [skill.key]: event.target.value }))}
                  />
                  {errors[skill.key] ? (
                    <span className="text-caption-xs text-destructive">{errors[skill.key]}</span>
                  ) : null}
                </label>
              ))}
              <label className="flex flex-col gap-2">
                <span className="text-body-sm-medium">Potencial</span>
                <Input
                  value={potential}
                  inputMode="numeric"
                  placeholder="82"
                  aria-invalid={Boolean(errors.potential)}
                  onChange={(event) => setPotential(event.target.value)}
                />
                <Hint error={errors.potential}>≥ maior atributo; igual a ele com 33+ anos</Hint>
              </label>
              <CalculatedValue label="Overall" hint="Calculado automaticamente" />
            </div>
          </div>
          <AttributePreview values={previewValues} potential={potentialNumber} />
        </div>
        <footer className="flex items-center justify-between border-t border-border pt-4">
          <p className="flex items-center gap-2 text-caption-xs text-muted-foreground">
            <Info className="size-3.5" aria-hidden="true" />O jogador começa livre e Apto.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              Salvar jogador
            </Button>
          </div>
        </footer>
      </form>
    </dialog>
  )
}

export { CreatePlayerDialog }
