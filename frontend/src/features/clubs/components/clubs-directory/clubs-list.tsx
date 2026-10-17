import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResourceEmpty, ResourceLoading } from "@/components/ui/resource-state"
import { ClubsTable } from "@/features/clubs/components/clubs-directory/clubs-table"
import { ClubsToolbar } from "@/features/clubs/components/clubs-directory/clubs-toolbar"
import type { Club, ClubSort } from "@/features/clubs/types/club.types"

function ClubsList({
  clubs,
  isPending,
  sort,
  onSortChange,
  onCreate,
}: {
  clubs: Club[]
  isPending: boolean
  sort: ClubSort
  onSortChange: (sort: ClubSort) => void
  onCreate: () => void
}) {
  if (isPending) return <ResourceLoading />

  if (clubs.length === 0) {
    return (
      <ResourceEmpty
        title="Nenhum clube cadastrado"
        description="Crie o primeiro clube para começar."
        action={
          <Button type="button" variant="outline" size="sm" onClick={onCreate}>
            <Plus /> Novo clube
          </Button>
        }
      />
    )
  }

  return (
    <section className="w-full overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <ClubsToolbar count={clubs.length} sort={sort} onSortChange={onSortChange} />
      <ClubsTable clubs={clubs} />
    </section>
  )
}

export { ClubsList }
