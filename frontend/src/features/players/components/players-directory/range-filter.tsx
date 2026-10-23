import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

function RangeFilter({
  label,
  valueLabel,
  icon,
  min,
  max,
  align = "start",
  onMinChange,
  onMaxChange,
}: {
  label: string
  valueLabel?: string
  icon: ReactNode
  min: string
  max: string
  align?: "start" | "end"
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", closeOnOutside)
    return () => document.removeEventListener("pointerdown", closeOnOutside)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-body-sm shadow-xs outline-none hover:border-ring focus-visible:border-ring focus-visible:shadow-focus"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className={valueLabel ? "text-foreground" : "text-muted-foreground"}>{valueLabel ?? label}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </button>
      {open ? (
        <div
          className={`absolute top-11 z-10 flex w-56 flex-col gap-2 rounded-lg border border-border bg-popover p-3 shadow-md ${align === "end" ? "right-0" : "left-0"}`}
        >
          <label className="flex flex-col gap-1 text-caption-xs text-muted-foreground">
            Mínimo
            <Input value={min} onChange={(event) => onMinChange(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-caption-xs text-muted-foreground">
            Máximo
            <Input value={max} onChange={(event) => onMaxChange(event.target.value)} />
          </label>
        </div>
      ) : null}
    </div>
  )
}

export { RangeFilter }
