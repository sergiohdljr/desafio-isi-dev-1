import { useState } from "react"
import { ClipboardList, Coins, History, Landmark, SearchX, Shirt, ShoppingCart, Users, Wallet } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router"
import { useAppChrome } from "@/app/app-layout"
import { paths } from "@/app/routes"
import { ClubHistory } from "@/features/clubs/components/club-history"
import { LineupBoard } from "@/features/clubs/components/lineup-board"
import { SquadTable } from "@/features/clubs/components/squad-table"
import { useClub, useClubTransactions, useRefreshClubs } from "@/features/clubs/hooks/use-clubs"
import { ResourceEmpty, ResourceError, ResourceLoading } from "@/components/ui/resource-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Escudo } from "@/components/ui/escudo"
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
  const [section, setSection] = useState<"elenco" | "escalacao" | "historico">("elenco")
  const [created, setCreated] = useState(() => Boolean((location.state as { created?: boolean } | null)?.created))
  const { club, isPending, error } = useClub(id)
  const { count: historyCount } = useClubTransactions(id)
  useAppChrome({
    crumbs: [{ label: "Mercado" }, { label: "Clubes", to: paths.clubs }, { label: club?.name ?? "Clube" }],
    onRefresh: refreshClubs,
  })
  const squadSize = club?.players.length ?? 0

  return (
    <>
      <main className="flex flex-1 flex-col gap-[24px] px-[32px] pt-[28px] pb-[40px]">
        {isPending ? <ResourceLoading label="Carregando clube…" /> : null}
        {error && !club ? (
          error.toLowerCase().includes("não encontrado") ? (
            <ResourceEmpty
              icon={<SearchX className="size-6" aria-hidden />}
              title="Clube não encontrado"
              description={`A API não encontrou o clube ${id}. O endereço pode estar errado.`}
              action={
                <Button type="button" variant="outline" onClick={() => navigate(paths.clubs)}>
                  Voltar para clubes
                </Button>
              }
            />
          ) : (
            <ResourceError title="Não foi possível carregar o clube" onRetry={() => void refreshClubs()} />
          )
        ) : null}
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
                aria-selected={section === "historico"}
                className={
                  section === "historico"
                    ? "-mb-px flex h-[44px] items-center gap-[8px] border-b-2 border-primary px-[2px] text-body-sm-medium text-foreground"
                    : "flex h-[44px] items-center gap-[8px] px-[2px] text-body-sm-medium text-muted-foreground"
                }
                onClick={() => setSection("historico")}
              >
                <History className="size-4" aria-hidden />
                Histórico
                <span className="inline-flex h-[18px] items-center rounded-full bg-muted px-[6px] text-caption-xs-medium text-muted-foreground">
                  {historyCount}
                </span>
              </button>
            </div>
            {section === "elenco" && squadSize === 0 && !isPending ? (
              <ResourceEmpty
                icon={<Shirt className="size-6" aria-hidden />}
                title="O clube ainda não tem jogadores"
                description="Compre jogadores livres para formar o elenco."
                action={
                  <Button type="button" variant="outline" onClick={() => navigate(paths.players)}>
                    <Users /> Comprar jogadores
                  </Button>
                }
              />
            ) : null}
            {section === "elenco" && club && squadSize > 0 ? (
              <SquadTable
                players={club.players}
                clubId={club.id}
                clubName={club.name}
                onSold={refreshClubs}
                onViewHistory={() => setSection("historico")}
              />
            ) : null}
            {section === "escalacao" && club && squadSize === 0 ? (
              <ResourceEmpty
                icon={<Shirt className="size-6" aria-hidden />}
                title="O clube ainda não tem jogadores"
                description="Compre jogadores livres para formar o elenco."
                action={
                  <Button type="button" variant="outline" onClick={() => navigate(paths.players)}>
                    <Users /> Comprar jogadores
                  </Button>
                }
              />
            ) : null}
            {section === "escalacao" && club && squadSize > 0 ? (
              <LineupBoard clubId={club.id} clubName={club.name} squad={club.players} />
            ) : null}
            {section === "historico" && club ? <ClubHistory clubId={club.id} players={club.players} /> : null}
          </>
        ) : null}
      </main>
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
    </>
  )
}

export { ClubPage }
