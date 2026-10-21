import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md px-2 py-0.5 text-caption-xs-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border bg-background text-foreground",
        success: "border border-success-soft-border bg-success-soft text-success-soft-foreground",
        warning: "border border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
        destructive: "border border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  dot = false,
  icon,
  children,
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean
    icon?: ReactNode
  }) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant, className }))}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {icon ? (
        <span className="[&_svg]:size-3" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}

export { Badge }
