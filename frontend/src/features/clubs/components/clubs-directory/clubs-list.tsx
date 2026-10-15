import { ClubsEmpty } from "@/features/clubs/components/clubs-directory/clubs-empty"
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
  if (!isPending && clubs.length === 0) {
    return <ClubsEmpty onCreate={onCreate} />
  }

  return (
    <section className="w-full overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
      <ClubsToolbar count={clubs.length} sort={sort} onSortChange={onSortChange} />
      <ClubsTable clubs={clubs} />
    </section>
  )
}

export { ClubsList }
