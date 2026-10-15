import { useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/features/players/components/market-dialog"
import { PlayerIdentity } from "@/features/players/components/player-dialogs/player-identity"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"
import type { Player } from "@/features/players/types/player.types"

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
  const { ref, titleId } = useModalDialog()

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
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-full max-w-115 overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Excluir {player.name}?
        </h2>
        <p className="text-body-sm text-muted-foreground">
          O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram
          gravadas.
        </p>
      </header>
      <DialogClose onClose={onClose} />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? <Alert variant="destructive" description={formError} /> : null}
        <PlayerIdentity player={player} badge="free" />
        <footer className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={pending}
          >
            <Trash2 />
            Excluir jogador
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

export { DeletePlayerDialog }
