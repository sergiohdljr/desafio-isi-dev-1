import { useEffect, type ReactNode } from "react"
import { CircleCheck, CircleX, Info, X } from "lucide-react"
import { cn } from "cn"

const toastIcons = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
}

const toastIconClass = {
  success: "text-success",
  error: "text-destructive",
  info: "text-primary",
}

const SUCCESS_DURATION_MS = 4000

function Toast({
  className,
  variant = "success",
  title,
  description,
  onClose,
}: {
  className?: string
  variant?: "success" | "error" | "info"
  title: string
  description?: string
  onClose?: () => void
}) {
  const Icon = toastIcons[variant]
  const staysOpen = variant === "error"

  useEffect(() => {
    if (staysOpen || !onClose) return
    const timeout = window.setTimeout(onClose, SUCCESS_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [onClose, staysOpen])

  return (
    <div
      data-slot="toast"
      role="status"
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg",
        className,
      )}
    >
      <span className={cn("pt-0.5", toastIconClass[variant])} aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-body-sm-medium">{title}</p>
        {description ? (
          <p className="text-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {staysOpen && onClose ? (
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:shadow-focus"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:inset-x-auto sm:right-4 sm:justify-end">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

export { Toast, ToastViewport }
