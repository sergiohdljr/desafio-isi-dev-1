import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-lg border px-4 py-3",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        destructive:
          "border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
        warning:
          "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
        success:
          "border-success-soft-border bg-success-soft text-success-soft-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const alertIcons = {
  default: Info,
  destructive: CircleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
}

function Alert({
  className,
  variant = "default",
  title,
  description,
  icon,
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    title?: string
    description: string
    icon?: ReactNode
  }) {
  const resolvedVariant = variant ?? "default"
  const Icon = alertIcons[resolvedVariant]
  const isError = resolvedVariant === "destructive"

  return (
    <div
      data-slot="alert"
      role={isError ? "alert" : "status"}
      className={cn(alertVariants({ variant: resolvedVariant, className }))}
    >
      <span className="pt-0.5" aria-hidden>
        {icon ?? <Icon className="size-4" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className="text-body-sm-medium">{title}</p> : null}
        <p
          className={cn(
            "text-body-sm",
            resolvedVariant === "default" && "text-muted-foreground",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

export { Alert, alertVariants }
