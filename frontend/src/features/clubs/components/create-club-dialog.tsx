import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { Circle, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import type { ClubField, CreateClubInput } from "@/features/clubs/types/club.types"
import { clubErrorDescription, fieldForClubError } from "@/features/clubs/utils/club-error"
import { normalizeAcronym, normalizeClubName } from "@/features/clubs/utils/normalize-club"
import { validateClubDraft } from "@/features/clubs/utils/validate-club-draft"

const NAME_HINT =
  "De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
const ACRONYM_HINT =
  "3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
const CREATE_ERROR_TITLE = "Não foi possível criar o clube"
const ACRONYM_PATTERN = /[^A-Za-z]/g

function CreateClubDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: CreateClubInput) => Promise<unknown>
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [name, setName] = useState("")
  const [acronym, setAcronym] = useState("")
  const [invalidField, setInvalidField] = useState<ClubField | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  function close() {
    ref.current?.close()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const issue = validateClubDraft({ name, acronym })
    if (issue) {
      setInvalidField(issue.field)
      setFormError(issue.message)
      return
    }

    setInvalidField(null)
    setFormError(null)
    setPending(true)
    try {
      await onSubmit({
        name: normalizeClubName(name),
        acronym: normalizeAcronym(acronym),
      })
      close()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir a ação."
      setInvalidField(fieldForClubError(message))
      setFormError(clubErrorDescription(message, name))
    } finally {
      setPending(false)
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="relative m-auto w-[480px] max-w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay open:flex open:flex-col open:gap-4"
    >
      <header className="flex flex-col gap-1.5 pr-8">
        <h2 id={titleId} className="text-heading-dialog">
          Novo clube
        </h2>
        <p className="text-body-sm text-muted-foreground">Informe o nome e a sigla do clube.</p>
      </header>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-[11px] right-[13px]"
        aria-label="Fechar"
        onClick={close}
      >
        <X />
      </Button>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? (
          <Alert variant="destructive" title={CREATE_ERROR_TITLE} description={formError} />
        ) : null}
        <label className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Nome</span>
          <span className="relative">
            <Circle
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={name}
              autoComplete="off"
              aria-invalid={invalidField === "name"}
              className="pl-9 aria-invalid:shadow-[0_0_0_3px_rgba(228,0,22,0.2)]!"
              onChange={(event) => {
                setName(event.target.value)
                setInvalidField((current) => (current === "name" ? null : current))
              }}
            />
          </span>
          <span className="text-caption-xs text-muted-foreground">{NAME_HINT}</span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm-medium">Sigla</span>
          <Input
            value={acronym}
            autoComplete="off"
            spellCheck={false}
            maxLength={3}
            aria-invalid={invalidField === "acronym"}
            className="aria-invalid:shadow-[0_0_0_3px_rgba(228,0,22,0.2)]!"
            onChange={(event) => {
              setAcronym(event.target.value.toUpperCase().replace(ACRONYM_PATTERN, "").slice(0, 3))
              setInvalidField((current) => (current === "acronym" ? null : current))
            }}
          />
          <span className="text-caption-xs text-muted-foreground">{ACRONYM_HINT}</span>
        </label>
        <p className="flex items-center gap-2.5 rounded-lg border border-border bg-muted-subtle px-3 py-2.5 text-body-sm text-muted-foreground">
          <Wallet className="size-4 shrink-0" aria-hidden />
          O clube começa com 300,00 em caixa e sem jogadores.
        </p>
        <footer className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Criar clube
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

export { CreateClubDialog }
