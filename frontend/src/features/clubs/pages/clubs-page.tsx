import { useState } from "react"
import { Plus, Shield } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { ClubsList } from "@/features/clubs/components/clubs-directory"
import { STARTING_CASH } from "@/features/clubs/consts/club-draft"
import { CLUBS_CRUMBS, DEFAULT_CLUB_SORT, MAX_CLUBS } from "@/features/clubs/consts/clubs-directory"
import { useClubs, useRefreshClubs } from "@/features/clubs/hooks/use-clubs"
import type { ClubSort } from "@/features/clubs/types/club.types"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { money } from "@/features/players/consts/directory"

function ClubsPage() {
  const refreshClubs = useRefreshClubs()
  const { openCreateClub } = useAppChrome({ crumbs: CLUBS_CRUMBS, onRefresh: refreshClubs })
  const [sort, setSort] = useState<ClubSort>(DEFAULT_CLUB_SORT)
  const { clubs, isPending, error } = useClubs(sort)

  return (
    <main className="flex flex-1 flex-col gap-[24px] px-[32px] pt-[28px] pb-[40px]">
      <div className="flex w-full items-center gap-[16px]">
        <div className="flex min-w-0 flex-1 items-center gap-[16px]">
          <span className="inline-flex size-[48px] shrink-0 items-center justify-center rounded-[12px] border border-primary bg-primary-soft text-primary">
            <Shield className="size-[22px]" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h1 className="text-heading-page">Clubes</h1>
            <p className="text-body-sm text-muted-foreground">
              Cada clube começa com {money.format(STARTING_CASH)} em caixa e sem jogadores. A liga aceita no máximo{" "}
              {MAX_CLUBS} clubes.
            </p>
          </div>
        </div>
        <Button type="button" className="h-[36px] gap-[8px] px-[16px]!" onClick={openCreateClub}>
          <Plus />
          Novo clube
        </Button>
      </div>

      {error ? <Alert variant="destructive" description={error} /> : null}

      <ClubsList clubs={clubs} isPending={isPending} sort={sort} onSortChange={setSort} onCreate={openCreateClub} />

      {clubs.length > 0 ? (
        <p className="text-caption-xs text-muted-foreground">
          Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor, com empate desfeito pelo nome.
        </p>
      ) : null}
    </main>
  )
}

export { ClubsPage }
