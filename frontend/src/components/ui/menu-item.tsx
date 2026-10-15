import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

function MenuItem({
  className,
  icon,
  children,
  ...props
}: ComponentProps<"button"> & {
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      data-slot="menu-item"
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-body-sm text-popover-foreground outline-none hover:bg-accent focus-visible:bg-accent focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="text-muted-foreground [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-left">{children}</span>
    </button>
  )
}

export { MenuItem }
