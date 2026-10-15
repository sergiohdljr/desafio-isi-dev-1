import { ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CLUB_SORT_OPTIONS, MAX_CLUBS } from "@/features/clubs/consts/clubs-directory"
import type { ClubSort } from "@/features/clubs/types/club.types"
import { capitalizePt } from "@/features/clubs/utils/capitalize-pt"
import { clubCountLabel } from "@/features/clubs/utils/club-count-label"

function ClubsToolbar({
  count,
  sort,
  onSortChange,
}: {
  count: number
  sort: ClubSort
  onSortChange: (sort: ClubSort) => void
}) {
  const sortLabel = CLUB_SORT_OPTIONS.find((item) => item.value === sort)?.label ?? "nome"

  return (
    <div className="flex items-center justify-between border-b border-border px-[16px] py-[12px]">
      <div className="flex items-center gap-[8px]">
        <p className="text-body-sm-medium">{clubCountLabel(count)}</p>
        <Badge variant="secondary">
          {count} de {MAX_CLUBS}
        </Badge>
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          if (!value) return
          onSortChange(value as ClubSort)
        }}
      >
        <SelectTrigger className="w-[338px]" aria-label="Ordenar por">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <SelectValue>{`Ordenar: ${sortLabel}`}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <p className="px-2 py-1.5 text-caption-xs-medium text-muted-foreground">Ordenar por</p>
          {CLUB_SORT_OPTIONS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {capitalizePt(item.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { ClubsToolbar }
