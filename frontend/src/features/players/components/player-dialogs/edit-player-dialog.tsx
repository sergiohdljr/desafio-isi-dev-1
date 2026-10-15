import { useState, type FormEvent } from "react"
import { Lock, UserRound } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogClose, coins } from "@/features/players/components/market-dialog"
import { Hint } from "@/features/players/components/player-dialogs/hint"
import { PositionChoices } from "@/features/players/components/player-dialogs/position-choices"
import { AGE_MAX, AGE_MIN } from "@/features/players/consts/directory"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"
import type { Player, Position } from "@/features/players/types/player.types"
import { parseInteger } from "@/features/players/utils/parse-integer"
import { normalizePlayerName, validatePlayerName } from "@/features/players/utils/validate-player-name"

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
  const { ref, titleId } = useModalDialog()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    const nameError = validatePlayerName(name)
    if (nameError) next.name = nameError
    const ageNumber = parseInteger(age)
    if (ageNumber === null || ageNumber < AGE_MIN || ageNumber > AGE_MAX) {
      next.age = `De ${AGE_MIN} a ${AGE_MAX} anos.`
    } else if (ageNumber < player.age) {
      next.age = `De ${AGE_MIN} a ${AGE_MAX}, sem diminuir (atual: ${player.age}).`
    }
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
        name: normalizePlayerName(name),
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
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-140 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Editar jogador
        </h2>
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
            <UserRound
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={name}
              className="pl-9"
              aria-invalid={Boolean(errors.name)}
              onChange={(event) => setName(event.target.value)}
            />
          </span>
          <Hint error={errors.name}>De 3 a 100 caracteres, com pelo menos duas palavras e sem números.</Hint>
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Posição</span>
          <PositionChoices
            value={position}
            onChange={setPosition}
            lockedValue={lockedPosition ? player.position : undefined}
          />
          {lockedPosition ? (
            <span className="text-caption-xs text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Idade</span>
            <Input
              value={age}
              inputMode="numeric"
              aria-invalid={Boolean(errors.age)}
              onChange={(event) => setAge(event.target.value)}
            />
            <Hint error={errors.age}>{`De ${AGE_MIN} a ${AGE_MAX}, sem diminuir (atual: ${player.age}).`}</Hint>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm-medium">Agilidade</span>
            <Input
              value={agility}
              inputMode="numeric"
              aria-invalid={Boolean(errors.agility)}
              onChange={(event) => setAgility(event.target.value)}
            />
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar alterações
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

export { EditPlayerDialog }
