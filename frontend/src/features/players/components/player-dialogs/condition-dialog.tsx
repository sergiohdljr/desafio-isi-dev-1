import { useState, type FormEvent } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DialogClose } from "@/features/players/components/market-dialog"
import { PlayerIdentity } from "@/features/players/components/player-dialogs/player-identity"
import { CONDITION_NOTES } from "@/features/players/consts/condition-notes"
import { CONDITIONS } from "@/features/players/consts/player-options"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"
import type { Condition, Player } from "@/features/players/types/player.types"

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
  const { ref, titleId } = useModalDialog()
  const blockedApto = player.condition === "DOENTE"

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
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-130 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Alterar condição física
        </h2>
        <p className="text-body-sm text-muted-foreground">
          A condição muda o desconto do valor de mercado, recalculado ao salvar.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <PlayerIdentity player={player} badge="condition" />
        <RadioGroup
          value={condition}
          onValueChange={(value) => value && setCondition(value as Condition)}
          className="gap-2"
        >
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar condição
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

export { ConditionDialog }
