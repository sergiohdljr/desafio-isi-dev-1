import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function PaginationItem({
  className,
  page,
  current = false,
  ...props
}: ComponentProps<"button"> & {
  page: number
  current?: boolean
}) {
  return (
    <button
      type="button"
      data-slot="pagination-item"
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-body-sm-medium outline-none hover:bg-muted focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50",
        current ? "border border-border bg-background text-foreground shadow-xs" : "text-foreground",
        className,
      )}
      {...props}
    >
      {page}
    </button>
  )
}

export { PaginationItem }
