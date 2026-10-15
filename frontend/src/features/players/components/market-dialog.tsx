import { useEffect, useId, useRef, type ReactNode } from "react"
import { CircleCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectContainer } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { X } from "lucide-react"
import { AVATAR_TONES } from "@/features/players/consts/directory"
import { initials, positionLabel } from "@/features/players/utils/player-display"
import type { Player } from "@/features/players/types/player.types"

const coins = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

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

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" className="absolute top-3 right-3" aria-label="Fechar" onClick={onClose}>
      <X />
    </Button>
  )
}

function MarketDialog({
  title,
  description,
  onClose,
  wide = false,
  leading,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  wide?: boolean
  leading?: ReactNode
  children: ReactNode
}) {
  const { ref, titleId } = useModalDialog()
  return (
    <SelectContainer container={ref}>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={onClose}
        className={cn(
          "m-auto w-full overflow-visible rounded-[14px] border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-overlay",
          wide ? "max-w-[560px]" : "max-w-[520px]",
        )}
      >
        <DialogClose onClose={onClose} />
        {leading}
        <header className={cn("pr-8", leading && "mt-4")}>
          <h2 id={titleId} className="text-heading-dialog">{title}</h2>
          <p className="mt-1.5 text-body-sm text-muted-foreground">{description}</p>
        </header>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
      </dialog>
    </SelectContainer>
  )
}

function SuccessMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
      <CircleCheck className="size-5" aria-hidden />
    </div>
  )
}

function PlayerMarketCard({ player }: { player: Pick<Player, "id" | "name" | "position" | "age" | "market_value"> }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted-subtle px-3.5 py-3">
      <Avatar initials={initials(player.name)} className={AVATAR_TONES[player.id % AVATAR_TONES.length]} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-medium">{player.name}</p>
        <p className="text-caption-xs text-muted-foreground">
          {player.position} · {positionLabel(player.position)} · {player.age} anos
        </p>
      </div>
      <div className="text-right">
        <p className="text-caption-xs text-muted-foreground">Valor de mercado</p>
        <p className="text-heading-card">{coins.format(player.market_value)}</p>
      </div>
    </div>
  )
}

function RulesNote({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-caption-xs text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}

function PendingNote({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-caption-xs text-muted-foreground">
      <Info className="size-3.5" aria-hidden />
      {children}
    </p>
  )
}

function SummaryRow({
  label,
  hint,
  value,
  emphasis = false,
  last = false,
  valueClassName,
}: {
  label: string
  hint?: string
  value: ReactNode
  emphasis?: boolean
  last?: boolean
  valueClassName?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-3.5 py-2.5", !last && "border-b border-border", emphasis && "bg-muted-subtle")}>
      <dt>
        <span className={emphasis ? "text-body-sm-semibold" : "text-muted-foreground"}>{label}</span>
        {hint ? <span className="block text-caption-xs text-muted-foreground">{hint}</span> : null}
      </dt>
      <dd className={cn(emphasis ? "text-heading-card tabular-nums" : "text-body-sm-medium tabular-nums", valueClassName)}>{value}</dd>
    </div>
  )
}

function formatLoyalty(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}, ${match[4]}:${match[5]}`
}

function signedCoins(value: number) {
  const formatted = coins.format(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

export {
  MarketDialog,
  PendingNote,
  PlayerMarketCard,
  RulesNote,
  SuccessMark,
  SummaryRow,
  coins,
  formatLoyalty,
  signedCoins,
}
