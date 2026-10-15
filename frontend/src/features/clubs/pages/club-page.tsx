import { useState } from "react"
import {
  ChevronRight,
  ClipboardList,
  Coins,
  History,
  Landmark,
  PanelLeft,
  RefreshCw,
  Shirt,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router"
import { pathForSidebar, paths } from "@/app/routes"
import { CreateClubDialog } from "@/features/clubs/components/create-club-dialog"
import { EmptySquad } from "@/features/clubs/components/empty-squad"
import { LineupBoard } from "@/features/clubs/components/lineup-board"
import { SquadTable } from "@/features/clubs/components/squad-table"
import { useClub, useClubTransactions, useClubs, useCreateClub, useRefreshClubs } from "@/features/clubs/hooks/use-clubs"
import { usePlayersDirectory } from "@/features/players/hooks/use-players"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Escudo } from "@/components/ui/escudo"
import { Sidebar } from "@/components/ui/sidebar"
import { SummaryCard } from "@/components/ui/summary-card"
import { Toast, ToastViewport } from "@/components/ui/toast"

const SQUAD_LIMIT = 12

const money = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function ClubPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const id = Number(params.id)
  const refreshClubs = useRefreshClubs()
  const createClub = useCreateClub()
  const [collapsed, setCollapsed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [section, setSection] = useState<"elenco" | "escalacao">("elenco")
  const [created, setCreated] = useState(
    () => Boolean((location.state as { created?: boolean } | null)?.created),
  )
  const { club, isPending, error } = useClub(id)
  const { count: historyCount } = useClubTransactions(id)
  const { clubs } = useClubs("name")
  const { counts } = usePlayersDirectory({
    sort: "name",
    scope: "all",
    page: 1,
    limit: 10,
  })
  const squadSize = club?.players.length ?? 0

  return (
    <div className="flex min-h-svh bg-sidebar text-foreground">
      <Sidebar
        active="Clubes"
        activeClub={club?.name}
        collapsed={collapsed}
        onHome={() => navigate(paths.home)}
        onNavigate={(label) => {
          const path = pathForSidebar(label)
          if (path) navigate(path)
        }}
        onCreateClub={() => setCreating(true)}
        counts={{ players: counts.all, clubs: clubs.length }}
        clubs={clubs.map((item) => ({
          initial: item.name.charAt(0),
          name: item.name,
          href: paths.club(item.id),
        }))}
      />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col py-2 pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-sm">
          <header className="flex h-[56px] shrink-0 items-center gap-[8px] border-b border-border px-[16px]">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeft className="size-4" />
            </Button>
            <span className="h-[16px] w-px shrink-0 bg-border" aria-hidden />
            <p className="flex min-w-0 flex-1 items-center gap-[8px] pl-[4px] text-body-sm text-muted-foreground">
              <span>Mercado</span>
              <ChevronRight className="size-3.5" aria-hidden />
              <button type="button" className="hover:text-foreground" onClick={() => navigate(paths.clubs)}>
                Clubes
              </button>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="truncate text-foreground">{club?.name ?? "Clube"}</span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Atualizar dados"
              onClick={() => void refreshClubs()}
            >
              <RefreshCw className="size-4" />
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-[24px] overflow-y-auto px-[32px] pt-[28px] pb-[40px]">
            {error ? <Alert variant="destructive" description={error} /> : null}
            {club ? (
              <>
                <div className="flex w-full items-center gap-[16px]">
                  <Escudo sigla={club.acronym} size="lg" className="rounded-[12px]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <h1 className="text-heading-page">{club.name}</h1>
                    <div className="flex items-center gap-[6px]">
                      <Badge variant="outline">Sigla {club.acronym}</Badge>
                      <Badge variant="outline" icon={<Users className="size-3" />}>
                        {squadSize} de {SQUAD_LIMIT} jogadores
                      </Badge>
                    </div>
                  </div>
                  <Button type="button" className="h-[36px] gap-[8px] px-[16px]!" onClick={() => navigate(paths.players)}>
                    <ShoppingCart />
                    Comprar jogadores
                  </Button>
                </div>
                <div className="grid w-full grid-cols-4 gap-[16px]">
                  <SummaryCard
                    label="Caixa"
                    value={money.format(club.cash)}
                    note="Só muda por compras e vendas"
                    icon={<Wallet className="size-4" />}
                  />
                  <SummaryCard
                    label="Valor do elenco"
                    value={money.format(club.squad_value)}
                    note="Soma dos valores de mercado"
                    icon={<Coins className="size-4" />}
                  />
                  <SummaryCard
                    label="Patrimônio"
                    value={money.format(club.net_worth)}
                    note="Caixa + valor do elenco"
                    icon={<Landmark className="size-4" />}
                  />
                  <SummaryCard
                    label="Elenco"
                    value={`${squadSize} de ${SQUAD_LIMIT}`}
                    unit=""
                    note="Limite de 12 jogadores"
                    icon={<Shirt className="size-4" />}
                  />
                </div>
                <div className="flex w-full gap-[16px] border-b border-border" role="tablist" aria-label="Seções do clube">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={section === "elenco"}
                    className={
                      section === "elenco"
                        ? "-mb-px flex h-[44px] items-center gap-[8px] border-b-2 border-primary px-[2px] text-body-sm-medium text-foreground"
                        : "flex h-[44px] items-center gap-[8px] px-[2px] text-body-sm-medium text-muted-foreground"
                    }
                    onClick={() => setSection("elenco")}
                  >
                    <Shirt className="size-4" aria-hidden />
                    Elenco
                    <span className="inline-flex h-[18px] items-center rounded-full bg-primary-soft px-[6px] text-caption-xs-medium text-primary-soft-foreground">
                      {squadSize}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={section === "escalacao"}
                    className={
                      section === "escalacao"
                        ? "-mb-px flex h-[44px] items-center gap-[8px] border-b-2 border-primary px-[2px] text-body-sm-medium text-foreground"
                        : "flex h-[44px] items-center gap-[8px] px-[2px] text-body-sm-medium text-muted-foreground"
                    }
                    onClick={() => setSection("escalacao")}
                  >
                    <ClipboardList className="size-4" aria-hidden />
                    Escalação
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected="false"
                    className="flex h-[44px] items-center gap-[8px] px-[2px] text-body-sm-medium text-muted-foreground"
                  >
                    <History className="size-4" aria-hidden />
                    Histórico
                    <span className="inline-flex h-[18px] items-center rounded-full bg-muted px-[6px] text-caption-xs-medium text-muted-foreground">
                      {historyCount}
                    </span>
                  </button>
                </div>
                {section === "elenco" && squadSize === 0 && !isPending ? (
                  <EmptySquad onBrowse={() => navigate(paths.players)} />
                ) : null}
                {section === "elenco" && club && squadSize > 0 ? (
                  <SquadTable players={club.players} onSold={refreshClubs} />
                ) : null}
                {section === "escalacao" && club && squadSize === 0 ? (
                  <EmptySquad onBrowse={() => navigate(paths.players)} />
                ) : null}
                {section === "escalacao" && club && squadSize > 0 ? (
                  <LineupBoard clubId={club.id} clubName={club.name} squad={club.players} />
                ) : null}
              </>
            ) : null}
          </main>
        </div>
      </div>
      {creating ? (
        <CreateClubDialog
          onClose={() => setCreating(false)}
          onSubmit={async (input) => {
            const createdClub = await createClub(input)
            navigate(paths.club(createdClub.id), { state: { created: true } })
          }}
        />
      ) : null}
      {created && club ? (
        <ToastViewport>
          <Toast
            variant="success"
            title="Clube criado"
            description={`${club.name} (${club.acronym}) começa com ${money.format(club.cash)} em caixa.`}
            onClose={() => setCreated(false)}
          />
        </ToastViewport>
      ) : null}
    </div>
  )
}

export { ClubPage }
