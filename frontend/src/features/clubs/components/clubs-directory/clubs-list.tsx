import { Plus, Shield } from "lucide-react"
import { STARTING_CASH } from "@/features/clubs/consts/club-draft"
import { Button } from "@/components/ui/button"
import { ResourceEmpty, ResourceLoading } from "@/components/ui/resource-state"
import { money } from "@/features/players/consts/directory"
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
  if (isPending) return <ResourceLoading label="Carregando clubes…" />

  if (clubs.length === 0) {
    return (
      <ResourceEmpty
        icon={<Shield className="size-6" aria-hidden />}
        title="Nenhum clube cadastrado"
        description={`Crie o primeiro clube com nome e sigla. Ele começa com ${money.format(STARTING_CASH)} em caixa e sem jogadores.`}
        action={
          <Button type="button" variant="outline" onClick={onCreate}>
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
