import { cn } from "@/lib/utils"

function Kbd({
  className,
  children,
}: {
  className?: string
  children: string
}) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 items-center justify-center rounded-sm border border-border bg-muted px-1.5 text-caption-xs-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export { Kbd }
