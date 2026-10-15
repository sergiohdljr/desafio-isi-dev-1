import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { ChartBar, Info, Lock, UserRound, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Club } from "@/features/clubs/types/club.types"
import type { Condition, Player, Position } from "@/features/players/types/player.types"
import { Alert } from "@/components/ui/alert"

const POSITIONS: { value: Position; label: string }[] = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "MEI", label: "Meio-campo" },
  { value: "ATA", label: "Atacante" },
]

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "APTO", label: "Apto" },
  { value: "MAL_CONDICIONADO", label: "Mal condicionado" },
  { value: "DOENTE", label: "Doente" },
]

const SKILLS = [
  { key: "pace", label: "Velocidade" },
  { key: "shooting", label: "Finalização" },
  { key: "passing", label: "Passe" },
  { key: "dribbling", label: "Drible" },
  { key: "defending", label: "Defesa" },
  { key: "physical", label: "Físico" },
] as const

type SkillKey = (typeof SKILLS)[number]["key"]

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-full max-w-lg rounded-xl border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay"
    >
      <h2 id={titleId} className="text-heading-dialog">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </dialog>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-body-sm-medium">
      {label}
      {children}
      {error ? <span className="text-caption-xs text-destructive">{error}</span> : null}
    </label>
  )
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) return null
  return Number(value)
}

const SKILL_SCALE = 99

function attributeFill(value: number | null) {
  if (value === null || value < 1) return 0
  return Math.min(100, (value / SKILL_SCALE) * 100)
}

function Hint({ children, error }: { children: string; error?: string }) {
  return (
    <span className={error ? "text-caption-xs text-destructive" : "text-caption-xs text-muted-foreground"}>
      {error ?? children}
    </span>
  )
}

function CalculatedValue({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm-medium text-muted-foreground">{label}</span>
      <div className="flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-3 text-body-sm text-muted-foreground">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        Após salvar
      </div>
      <span className="text-caption-xs text-muted-foreground">{hint}</span>
    </div>
  )
}

function AttributePreview({
  values,
  potential,
}: {
  values: { label: string; value: number | null }[]
  potential: number | null
}) {
  const potentialLabel = potential === null ? "—" : String(potential)
  return (
    <aside className="flex w-61 shrink-0 flex-col gap-2.5 rounded-xl border bg-muted-subtle p-3">
      <p className="flex items-center gap-1.5 text-caption-xs-medium text-muted-foreground">
        <ChartBar className="size-3.5" aria-hidden="true" />
        Prévia dos atributos
      </p>
      {values.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-17.5 shrink-0 text-caption-xs text-muted-foreground">{item.label}</span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
              style={{ width: `${attributeFill(potential)}%` }}
            />
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${attributeFill(item.value)}%` }}
            />
          </span>
          <span className="w-5 text-right text-caption-xs-medium tabular-nums">
            {item.value === null ? "—" : item.value}
          </span>
        </div>
      ))}
      <p className="text-caption-xs text-muted-foreground">
        Faixa clara: até o potencial ({potentialLabel}). A prévia só desenha os valores digitados; não calcula overall nem valor base.
      </p>
    </aside>
  )
}

function validateName(name: string) {
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    const nameError = validateName(name)
    if (nameError) next.name = nameError
    if (!position) next.position = "Escolha uma posição."
    const ageNumber = parseInteger(age)
    if (ageNumber === null || ageNumber < 16 || ageNumber > 45) {
      next.age = "De 16 a 45 anos."
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
    const potentialNumber = parseInteger(potential)
    if (potentialNumber === null) next.potential = "Informe o potencial."
    else if (potentialNumber < 1 || potentialNumber > 99) {
      next.potential = "Use um valor de 1 a 99."
    }
    const skillValues = Object.values(skillNumbers)
    if (skillValues.length === SKILLS.length) {
      if (skillValues.reduce((sum, value) => sum + value, 0) > 480) {
        next.skills = "A soma dos indicadores não pode passar de 480."
      }
      const best = Math.max(...skillValues)
      if (potentialNumber !== null && potentialNumber < best) {
        next.potential = "O potencial não pode ser menor que o maior indicador."
      }
      if (
        ageNumber !== null &&
        ageNumber >= 33 &&
        potentialNumber !== null &&
        potentialNumber !== best
      ) {
        next.potential = "A partir dos 33 anos o potencial é igual ao maior indicador."
      }
    }
    setErrors(next)
    if (Object.keys(next).length > 0 || !position || ageNumber === null || agilityNumber === null || potentialNumber === null) {
      setFormError("Corrija os campos destacados para salvar.")
      return
    }
    setFormError(null)
    setPending(true)
    try {
      await onSubmit({
        name: name.trim().replace(/\s+/g, " "),
        position,
        age: ageNumber,
        agility: agilityNumber,
        potential: potentialNumber,
        ...skillNumbers,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o jogador.")
    } finally {
      setPending(false)
    }
  }

  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const potentialNumber = parseInteger(potential)
  const previewValues = SKILLS.map((skill) => ({
    label: skill.label,
    value: parseInteger(skills[skill.key]),
  }))
  const firstSkills = SKILLS.slice(0, 4)
  const secondSkills = SKILLS.slice(4)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-h-none max-w-213 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Novo jogador
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.
        </p>
      </header>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-3 right-3"
        aria-label="Fechar"
        onClick={onClose}
      >
        <X />
      </Button>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <label className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Nome</span>
          <span className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
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
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Posição" aria-invalid={Boolean(errors.position)}>
          <span className="text-body-sm-medium">Posição</span>
          <div className="flex gap-2">
            {POSITIONS.map((item) => {
              const selected = position === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPosition(item.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center rounded-md border px-1 py-2 outline-none focus-visible:shadow-focus",
                    selected
                      ? "border-primary bg-primary-soft text-primary-soft-foreground"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <span className="text-body-sm-semibold">{item.value}</span>
                  <span className={selected ? "text-caption-xs" : "text-caption-xs text-muted-foreground"}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
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
            <Hint error={errors.age}>De 16 a 45 anos.</Hint>
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
            Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis atributos não pode passar de 480.
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
                    onChange={(event) =>
                      setSkills((current) => ({ ...current, [skill.key]: event.target.value }))
                    }
                  />
                  {errors[skill.key] ? <span className="text-caption-xs text-destructive">{errors[skill.key]}</span> : null}
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
                    onChange={(event) =>
                      setSkills((current) => ({ ...current, [skill.key]: event.target.value }))
                    }
                  />
                  {errors[skill.key] ? <span className="text-caption-xs text-destructive">{errors[skill.key]}</span> : null}
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
            <Info className="size-3.5" aria-hidden="true" />
            O jogador começa livre e Apto.
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

function EditPlayerDialog({
  player,
  onClose,
  onSubmit,
}: {
  player: Player
  onClose: () => void
  onSubmit: (input: { name: string; position: Position; age: number; agility: number }) => Promise<void>
}) {
  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState<Position>(player.position)
  const [age, setAge] = useState(String(player.age))
  const [agility, setAgility] = useState(String(player.agility))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const lockedPosition = player.club_id !== null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    const nameError = validateName(name)
    if (nameError) next.name = nameError
    const ageNumber = parseInteger(age)
    if (ageNumber === null || ageNumber < 16 || ageNumber > 45) next.age = "De 16 a 45 anos."
    else if (ageNumber < player.age) next.age = `De 16 a 45, sem diminuir (atual: ${player.age}).`
    const agilityNumber = parseInteger(agility)
    const agilityMax = ageNumber !== null && ageNumber >= 35 ? 85 : 100
    if (agilityNumber === null || agilityNumber < 1 || agilityNumber > agilityMax) {
      next.agility = "De 1 a 100 (até 85 com 35 anos ou mais)."
    }
    setErrors(next)
    if (Object.keys(next).length > 0 || ageNumber === null || agilityNumber === null) {
      setFormError("Corrija os campos destacados para salvar.")
      return
    }
    setPending(true)
    try {
      await onSubmit({
        name: name.trim().replace(/\s+/g, " "),
        position,
        age: ageNumber,
        agility: agilityNumber,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar as alterações.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      title="Editar jogador"
      description="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <Field label="Nome" error={errors.name}>
          <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Posição">
          <Select value={position} onValueChange={(value) => value && setPosition(value as Position)} disabled={lockedPosition}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((item) => (
                <SelectItem key={item.value} value={item.value} disabled={lockedPosition && item.value !== player.position}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {lockedPosition ? (
            <span className="text-caption-xs text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </span>
          ) : null}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Idade" error={errors.age}>
            <Input value={age} inputMode="numeric" onChange={(event) => setAge(event.target.value)} aria-invalid={Boolean(errors.age)} />
          </Field>
          <Field label="Agilidade" error={errors.agility}>
            <Input value={agility} inputMode="numeric" onChange={(event) => setAgility(event.target.value)} aria-invalid={Boolean(errors.agility)} />
          </Field>
        </div>
        <p className="text-caption-xs text-muted-foreground">
          Não mudam depois do cadastro: valor base, indicadores e potencial.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ConditionDialog({
  player,
  onClose,
  onSubmit,
}: {
  player: Player
  onClose: () => void
  onSubmit: (condition: Condition) => Promise<void>
}) {
  const [condition, setCondition] = useState<Condition>(player.condition)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (player.condition === "DOENTE" && condition === "APTO") {
      setFormError("De Doente não passa direto para Apto.")
      return
    }
    setPending(true)
    try {
      await onSubmit(condition)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível alterar a condição.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <Select value={condition} onValueChange={(value) => value && setCondition(value as Condition)}>
          <SelectTrigger aria-label="Condição">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((item) => (
              <SelectItem key={item.value} value={item.value} disabled={player.condition === "DOENTE" && item.value === "APTO"}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar condição
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DeletePlayerDialog({
  player,
  onClose,
  onConfirm,
}: {
  player: Player
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      await onConfirm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível excluir o jogador.")
      setPending(false)
    }
  }

  return (
    <Modal
      title={`Excluir ${player.name}?`}
      description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="destructive" disabled={pending}>
            Excluir jogador
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DetailsDialog({ player, onClose }: { player: Player; onClose: () => void }) {
  const rows = [
    ["Overall", String(player.overall)],
    ["Potencial", String(player.potential)],
    ["Velocidade", String(player.pace)],
    ["Finalização", String(player.shooting)],
    ["Passe", String(player.passing)],
    ["Drible", String(player.dribbling)],
    ["Defesa", String(player.defending)],
    ["Físico", String(player.physical)],
  ]

  return (
    <Modal title={player.name} description="Ver detalhes" onClose={onClose}>
      <dl className="grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-caption-xs text-muted-foreground">{label}</dt>
            <dd className="text-body-sm-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  )
}

function BuyPlayerDialog({
  player,
  clubs,
  onClose,
  onSubmit,
}: {
  player: Player
  clubs: Club[]
  onClose: () => void
  onSubmit: (clubId: number, loyaltyUntil: string) => Promise<void>
}) {
  const [clubId, setClubId] = useState<string>("")
  const [loyalty, setLoyalty] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!clubId || !loyalty) {
      setFormError("Escolha o clube e a data de fidelidade.")
      return
    }
    setPending(true)
    try {
      await onSubmit(Number(clubId), `${loyalty}-03:00`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível comprar o jogador.")
      setPending(false)
    }
  }

  return (
    <Modal
      title={`Comprar ${player.name}`}
      description="Valor + taxa, até 50% do caixa, com contrato de fidelidade."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <Field label="Clube">
          <Select value={clubId || null} onValueChange={(value) => setClubId(value ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={String(club.id)}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fidelidade até">
          <Input type="datetime-local" value={loyalty} onChange={(event) => setLoyalty(event.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Comprar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export {
  BuyPlayerDialog,
  ConditionDialog,
  CreatePlayerDialog,
  DeletePlayerDialog,
  DetailsDialog,
  EditPlayerDialog,
  POSITIONS,
  CONDITIONS,
}
