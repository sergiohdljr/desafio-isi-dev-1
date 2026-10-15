import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActiveFilter } from "@/features/players/types/players-ui.types"

function ActiveFilterChips({
  filters,
  onClearAll,
  onClearOne,
}: {
  filters: ActiveFilter[]
  onClearAll: () => void
  onClearOne: (clear: () => void) => void
}) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap content-center items-center gap-2">
      <p className="text-body-sm text-muted-foreground">Filtros ativos:</p>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2.5 text-caption-xs-medium text-secondary-foreground"
        >
          {filter.label}
          <button
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-md"
            aria-label={`Remover filtro ${filter.label}`}
            onClick={() => onClearOne(filter.clear)}
          >
            <X className="size-4" aria-hidden />
          </button>
        </span>
      ))}
      <Button type="button" variant="link" size="sm" className="h-8 px-3" onClick={onClearAll}>
        Limpar filtros
      </Button>
    </div>
  )
}

export { ActiveFilterChips }
