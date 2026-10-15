import { cn } from "@/lib/utils"
import { POSITIONS } from "@/features/players/consts/player-options"
import type { Position } from "@/features/players/types/player.types"

function PositionChoices({
  value,
  onChange,
  lockedValue,
}: {
  value: Position | ""
  onChange: (value: Position) => void
  lockedValue?: Position
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Posição">
      {POSITIONS.map((item) => {
        const selected = value === item.value
        const disabled = lockedValue !== undefined && item.value !== lockedValue
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-md border px-1 py-2 outline-none focus-visible:shadow-focus disabled:opacity-45",
              selected
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : "border-border bg-background hover:bg-muted disabled:hover:bg-background",
            )}
          >
            <span className="text-body-sm-semibold">{item.value}</span>
            <span className={selected ? "text-caption-xs" : "text-caption-xs text-muted-foreground"}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { PositionChoices }
