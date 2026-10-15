import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const escudoVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-muted text-caption-xs-medium text-foreground",
  {
    variants: {
      size: {
        md: "size-9",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

function Escudo({
  className,
  size = "md",
  sigla,
}: ComponentProps<"span"> &
  VariantProps<typeof escudoVariants> & {
    sigla: string
  }) {
  return (
    <span
      data-slot="escudo"
      aria-hidden
      className={cn(escudoVariants({ size, className }))}
    >
      {sigla}
    </span>
  )
}

export { Escudo, escudoVariants }
