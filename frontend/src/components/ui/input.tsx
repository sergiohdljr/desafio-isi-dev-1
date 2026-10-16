import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-background px-3 text-foreground shadow-xs outline-none placeholder:text-muted-foreground hover:border-ring focus-visible:border-ring focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus",
  {
    variants: {
      fieldSize: {
        default: "h-9 text-body-sm",
        mobile: "h-10 text-body-base",
      },
    },
    defaultVariants: {
      fieldSize: "default",
    },
  },
)

function Input({
  className,
  fieldSize = "default",
  ...props
}: InputPrimitive.Props & VariantProps<typeof inputVariants>) {
  return <InputPrimitive data-slot="input" className={cn(inputVariants({ fieldSize, className }))} {...props} />
}

export { Input, inputVariants }
