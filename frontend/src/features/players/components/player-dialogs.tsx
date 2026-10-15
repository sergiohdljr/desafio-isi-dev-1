import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useNavigate } from "react-router"
import {
  ArrowRight,
  Calendar,
  ChartBar,
  ChartColumn,
  Clock,
  Coins,
  HeartPulse,
  Info,
  Lock,
  Pencil,
  Shield,
  ShoppingCart,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContainer,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { paths } from "@/app/routes"
import { ApiError } from "@/lib/http"
import {
  MarketDialog,
  PendingNote,
  PlayerMarketCard,
  RulesNote,
  SuccessMark,
  SummaryRow,
  coins,
  formatLoyalty,
} from "@/features/players/components/market-dialog"
import type { Purchase } from "@/features/players/api/players.api"
import type { Club } from "@/features/clubs/types/club.types"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import { CONDITIONS, POSITIONS } from "@/features/players/consts/player-options"
import type { Condition, Player, Position } from "@/features/players/types/player.types"
import { conditionLabel, initials, positionLabel } from "@/features/players/utils/player-display"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
    <SelectContainer container={ref}>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={onClose}
        className="m-auto w-full max-w-lg overflow-visible rounded-xl border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay"
      >
        <h2 id={titleId} className="text-heading-dialog">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-4">{children}</div>
      </dialog>
    </SelectContainer>
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

const CONDITION_NOTES: Record<Condition, string> = {
  APTO: "Sem desconto por condição.",
  MAL_CONDICIONADO: "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  DOENTE: "Desconto de 30%, com o mesmo ajuste de agilidade.",
}

function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])
  return { ref, titleId }
}

function conditionVariant(condition: Condition) {
  if (condition === "APTO") return "success" as const
  if (condition === "MAL_CONDICIONADO") return "warning" as const
  return "destructive" as const
}

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" className="absolute top-3 right-3" aria-label="Fechar" onClick={onClose}>
      <X />
    </Button>
  )
}

function PositionChoices({
  value,
  onChange,
  lockedValue,
}: {
  value: Position | ""
  onChange: (value: Position) => void
  lockedValue?: Position
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Posição">
      {POSITIONS.map((item) => {
        const selected = value === item.value
        const disabled = lockedValue !== undefined && item.value !== lockedValue
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-md border px-1 py-2 outline-none focus-visible:shadow-focus disabled:opacity-45",
              selected
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : "border-border bg-background hover:bg-muted disabled:hover:bg-background",
            )}
          >
            <span className="text-body-sm-semibold">{item.value}</span>
            <span className={selected ? "text-caption-xs" : "text-caption-xs text-muted-foreground"}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PlayerIdentity({ player, badge }: { player: Player; badge: "condition" | "free" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted-subtle px-3.5 py-3">
      <Avatar initials={initials(player.name)} className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-medium">{player.name}</p>
        <p className="text-caption-xs text-muted-foreground">
          {player.position} · {positionLabel(player.position)} · {player.age} anos
        </p>
      </div>
      {badge === "free" ? (
        <Badge variant="secondary">Livre</Badge>
      ) : (
        <Badge variant={conditionVariant(player.condition)} dot>
          {conditionLabel(player.condition)}
        </Badge>
      )}
    </div>
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

  const { ref, titleId } = useModalDialog()

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-140 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">Editar jogador</h2>
        <p className="text-body-sm text-muted-foreground">
          Edite nome, posição, idade e agilidade. Os demais dados não mudam.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <label className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Nome</span>
          <span className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={name} className="pl-9" aria-invalid={Boolean(errors.name)} onChange={(event) => setName(event.target.value)} />
          </span>
          <Hint error={errors.name}>De 3 a 100 caracteres, com pelo menos duas palavras e sem números.</Hint>
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Posição</span>
          <PositionChoices value={position} onChange={setPosition} lockedValue={lockedPosition ? player.position : undefined} />
          {lockedPosition ? (
            <span className="text-caption-xs text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Idade</span>
            <Input value={age} inputMode="numeric" aria-invalid={Boolean(errors.age)} onChange={(event) => setAge(event.target.value)} />
            <Hint error={errors.age}>{`De 16 a 45, sem diminuir (atual: ${player.age}).`}</Hint>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Agilidade</span>
            <Input value={agility} inputMode="numeric" aria-invalid={Boolean(errors.agility)} onChange={(event) => setAgility(event.target.value)} />
            <Hint error={errors.agility}>De 1 a 100 (até 85 com 35 anos ou mais).</Hint>
          </label>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5">
          <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-caption-xs text-muted-foreground">
            Não mudam depois do cadastro: valor base ({coins.format(player.base_value)}), indicadores e potencial.
          </p>
        </div>
        <footer className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={pending}>Salvar alterações</Button>
        </footer>
      </form>
    </dialog>
  )
}

function ConditionDialog({
  player,
  starterClub,
  onClose,
  onSubmit,
}: {
  player: Player
  starterClub?: string | null
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

  const { ref, titleId } = useModalDialog()
  const blockedApto = player.condition === "DOENTE"

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-130 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">Alterar condição física</h2>
        <p className="text-body-sm text-muted-foreground">
          A condição muda o desconto do valor de mercado, recalculado ao salvar.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <PlayerIdentity player={player} badge="condition" />
        <RadioGroup value={condition} onValueChange={(value) => value && setCondition(value as Condition)} className="gap-2">
          {CONDITIONS.map((item) => {
            const disabled = blockedApto && item.value === "APTO"
            const selected = condition === item.value
            return (
              <label
                key={item.value}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3.5 py-3",
                  selected ? "border-primary bg-primary-soft" : "border-border bg-background",
                  disabled && "opacity-55",
                )}
              >
                <RadioGroupItem value={item.value} disabled={disabled} className="mt-0.5" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-body-sm-medium">{item.label}</span>
                    {player.condition === item.value ? <Badge variant="secondary">Atual</Badge> : null}
                  </span>
                  <span className="text-caption-xs text-muted-foreground">{CONDITION_NOTES[item.value]}</span>
                  {disabled ? (
                    <span className="flex items-center gap-1.5 text-caption-xs-medium text-muted-foreground">
                      <Lock className="size-3" aria-hidden="true" />
                      De Doente não passa direto para Apto.
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </RadioGroup>
        {condition === "DOENTE" && starterClub ? (
          <Alert
            variant="warning"
            title={`${player.name} é titular`}
            description={`Ao passar a Doente, ele sai da escalação, e o ${starterClub} só volta a jogar partidas depois de escalar de novo os 5 titulares.`}
          />
        ) : null}
        <footer className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={pending}>Salvar condição</Button>
        </footer>
      </form>
    </dialog>
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

  const { ref, titleId } = useModalDialog()

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-115 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">Excluir {player.name}?</h2>
        <p className="text-body-sm text-muted-foreground">
          O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <PlayerIdentity player={player} badge="free" />
        <footer className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="destructive" className="bg-destructive text-white hover:bg-destructive/90" disabled={pending}>
            <Trash2 />
            Excluir jogador
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

const DETAIL_SKILLS = [
  { label: "Velocidade", key: "pace" },
  { label: "Finalização", key: "shooting" },
  { label: "Passe", key: "passing" },
  { label: "Drible", key: "dribbling" },
  { label: "Defesa", key: "defending" },
  { label: "Físico", key: "physical" },
] as const

function DetailsDialog({
  player,
  clubName,
  onClose,
  onEdit,
  onCondition,
  onBuy,
}: {
  player: Player
  clubName?: string
  onClose: () => void
  onEdit: () => void
  onCondition: () => void
  onBuy?: () => void
}) {
  const { ref, titleId } = useModalDialog()
  const skills = DETAIL_SKILLS.map((skill) => ({ label: skill.label, value: player[skill.key] }))

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-120 overflow-y-auto border-y-0 border-r-0 bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4.5"
    >
      <DialogClose onClose={onClose} />
      <header className="flex items-center gap-3.5 pr-8">
        <Avatar initials={initials(player.name)} size="lg" className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={titleId} className="text-heading-dialog">{player.name}</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{player.position}</Badge>
            <Badge variant={conditionVariant(player.condition)} dot>{conditionLabel(player.condition)}</Badge>
            {player.club_id === null ? <Badge variant="secondary">Livre</Badge> : null}
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <DetailStat icon={<Coins className="size-3.5" />} label="Valor de mercado" value={coins.format(player.market_value)} hint="Calculado automaticamente" />
        <DetailStat icon={<Wallet className="size-3.5" />} label="Valor base" value={coins.format(player.base_value)} hint="Calculado no cadastro" />
        <DetailStat icon={<ChartColumn className="size-3.5" />} label="Overall" value={String(player.overall)} hint="Calculado pela posição" />
        <DetailStat icon={<TrendingUp className="size-3.5" />} label="Potencial" value={String(player.potential)} hint="Informado no cadastro" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-card">Indicadores técnicos</h3>
          <p className="text-caption-xs text-muted-foreground">Escala de 1 a 99</p>
        </div>
        {skills.map((skill) => (
          <div key={skill.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-body-sm text-muted-foreground">{skill.label}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span className="absolute inset-y-0 left-0 rounded-full bg-chart-2" style={{ width: `${attributeFill(player.potential)}%` }} />
              <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${attributeFill(skill.value)}%` }} />
            </span>
            <span className="w-7 text-right text-body-sm-medium tabular-nums">{skill.value}</span>
          </div>
        ))}
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-xs bg-primary" /> Valor do atributo</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-xs bg-chart-2" /> Até o potencial ({player.potential}), que nenhum atributo passa</span>
        </p>
      </div>
      <dl className="rounded-lg border border-border text-body-sm">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <dt className="text-muted-foreground">Idade</dt>
          <dd className="text-body-sm-medium">{player.age} anos</dd>
        </div>
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <dt className="text-muted-foreground">Agilidade</dt>
          <dd className="text-body-sm-medium">{player.agility}</dd>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <dt className="text-muted-foreground">Clube</dt>
          <dd className="text-body-sm-medium">{clubName ?? "Livre"}</dd>
        </div>
      </dl>
      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onEdit}><Pencil /> Editar</Button>
          <Button type="button" variant="outline" onClick={onCondition}><HeartPulse /> Alterar condição</Button>
          {onBuy ? (
            <Button type="button" className="ml-auto" onClick={onBuy}><ShoppingCart /> Comprar</Button>
          ) : null}
        </div>
      </div>
    </dialog>
  )
}

function DetailStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3.5 py-3">
      <div className="flex items-center justify-between text-caption-xs-medium text-muted-foreground">
        {label}
        {icon}
      </div>
      <p className="text-display-kpi">{value}</p>
      <p className="text-caption-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

const FEE_RATE = 0.05
const FEE_THRESHOLD = 30

function BuyPlayerDialog({
  player,
  clubs,
  onClose,
  onSubmit,
}: {
  player: Player
  clubs: Club[]
  onClose: () => void
  onSubmit: (clubId: number, loyaltyUntil: string) => Promise<Purchase>
}) {
  const navigate = useNavigate()
  const [clubId, setClubId] = useState<string>("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [failure, setFailure] = useState<"network" | "refused" | null>(null)
  const [failureMessage, setFailureMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [purchase, setPurchase] = useState<Purchase | null>(null)

  const club = clubs.find((item) => String(item.id) === clubId)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!clubId || !date || !time) {
      setFieldError("Escolha o clube, a data e a hora da fidelidade.")
      return
    }
    setFieldError(null)
    setFailure(null)
    setPending(true)
    try {
      const result = await onSubmit(Number(clubId), `${date}T${time}-03:00`)
      setPurchase(result)
    } catch (error) {
      const offline = error instanceof ApiError && error.status === 0
      setFailure(offline ? "network" : "refused")
      setFailureMessage(error instanceof Error ? error.message : "Não foi possível comprar o jogador.")
      setPending(false)
    }
  }

  if (purchase && club) {
    return (
      <MarketDialog
        title="Compra concluída"
        description={`${player.name} agora é do ${club.name}.`}
        onClose={onClose}
        leading={<SuccessMark />}
      >
        <dl className="overflow-hidden rounded-[10px] border border-border text-body-sm">
          <SummaryRow label="Valor" hint="Valor de mercado no momento da compra" value={coins.format(purchase.value)} />
          <SummaryRow
            label="Taxa"
            hint={purchase.fee > 0 ? "5% do valor, porque passa de 30,00" : "Sem taxa, porque o valor não passa de 30,00"}
            value={coins.format(purchase.fee)}
          />
          <SummaryRow label="Custo total" hint="Valor + taxa" value={coins.format(purchase.value + purchase.fee)} emphasis />
          <SummaryRow label="Fim da fidelidade" value={formatLoyalty(purchase.contract.loyalty_until)} />
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <dt className="text-muted-foreground">Contrato</dt>
            <dd><Badge variant="success" dot>ATIVO</Badge></dd>
          </div>
          <SummaryRow label={`Novo caixa do ${club.name}`} value={coins.format(purchase.club_cash)} emphasis last />
        </dl>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(paths.club(club.id))}>
            Ver clube <ArrowRight />
          </Button>
          <Button type="button" onClick={onClose}>Fechar</Button>
        </div>
      </MarketDialog>
    )
  }

  return (
    <MarketDialog
      wide
      title="Comprar jogador"
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      onClose={onClose}
    >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {failure === "network" ? (
            <Alert variant="destructive" title="Sem conexão" description={failureMessage} />
          ) : null}
          {failure === "refused" ? (
            <Alert variant="destructive" title="Compra recusada" description={failureMessage} />
          ) : null}
          <PlayerMarketCard player={player} />
          <div className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Clube comprador</span>
            <Select
              value={clubId || null}
              onValueChange={(value) => setClubId(value ?? "")}
              items={clubs.map((item) => ({ value: String(item.id), label: clubOption(item) }))}
              disabled={pending}
            >
              <SelectTrigger>
                <Shield className="size-4 text-muted-foreground" aria-hidden />
                <SelectValue placeholder={clubs.length === 0 ? "Nenhum clube disponível" : "Selecione o clube"} />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {clubOption(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-caption-xs text-muted-foreground">
              {club
                ? `Caixa atual: ${coins.format(club.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
                : "O custo total (valor + taxa) pode ir até 50% do caixa."}
            </p>
            {fieldError ? <p className="text-caption-xs text-destructive">{fieldError}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Fim da fidelidade</span>
            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <Calendar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input type="date" className="pl-9" value={date} disabled={pending} aria-label="Data da fidelidade" onChange={(event) => setDate(event.target.value)} />
              </label>
              <label className="relative w-32 shrink-0">
                <Clock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input type="time" className="pl-9" value={time} disabled={pending} aria-label="Hora da fidelidade" onChange={(event) => setTime(event.target.value)} />
              </label>
            </div>
            <p className="text-caption-xs text-muted-foreground">
              Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).
            </p>
          </div>
          <RulesNote>
            {`A taxa é de ${FEE_RATE * 100}% do valor de mercado, só quando ele passa de ${coins.format(FEE_THRESHOLD)}. Taxa, custo e novo caixa são calculados ao confirmar.`}
          </RulesNote>
          {pending ? <PendingNote>Enviando a compra. Os botões ficam desabilitados.</PendingNote> : null}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              <ShoppingCart />
              {pending ? "Comprando…" : failure === "network" ? "Tentar de novo" : "Confirmar compra"}
            </Button>
          </div>
        </form>
    </MarketDialog>
  )
}

function clubOption(club: Club) {
  return `${club.name} (${club.acronym}) · caixa ${coins.format(club.cash)}`
}

export {
  BuyPlayerDialog,
  ConditionDialog,
  CreatePlayerDialog,
  DeletePlayerDialog,
  DetailsDialog,
  EditPlayerDialog,
}
