import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full bg-input transition-colors outline-none hover:bg-input/80 focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary data-checked:hover:bg-primary-hover",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 translate-x-0 rounded-full bg-background shadow-xs transition-transform data-checked:translate-x-3.5" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
