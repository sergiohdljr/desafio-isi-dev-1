import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-caption-xs-medium text-foreground",
  {
    variants: {
      size: {
        md: "size-8",
        lg: "size-10",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

function Avatar({
  className,
  size = "md",
  initials,
}: ComponentProps<"span"> &
  VariantProps<typeof avatarVariants> & {
    initials: string
  }) {
  return (
    <span
      data-slot="avatar"
      aria-hidden
      className={cn(avatarVariants({ size, className }))}
    >
      {initials}
    </span>
  )
}

export { Avatar, avatarVariants }
