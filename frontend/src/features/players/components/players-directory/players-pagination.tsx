import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginationItem } from "@/components/ui/pagination"

function PlayersPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  onPageChange,
}: {
  page: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-body-sm text-muted-foreground">
        Mostrando {rangeStart}–{rangeEnd} de {totalItems} jogadores
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Anterior
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .slice(0, 7)
          .map((item) => (
            <PaginationItem key={item} page={item} current={item === page} onClick={() => onPageChange(item)} />
          ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

export { PlayersPagination }
