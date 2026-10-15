import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SelectContainer } from "@/components/ui/select"
import { DialogClose } from "@/features/players/components/market-dialog/dialog-close"
import { useModalDialog } from "@/features/players/hooks/use-modal-dialog"

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
          <h2 id={titleId} className="text-heading-dialog">
            {title}
          </h2>
          <p className="mt-1.5 text-body-sm text-muted-foreground">{description}</p>
        </header>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
      </dialog>
    </SelectContainer>
  )
}

export { MarketDialog }
