import { useState } from "react"
import { ArrowUpDown, ChevronRight, PanelLeft, Plus, RefreshCw, Shield } from "lucide-react"
import { useNavigate } from "react-router"
import { pathForSidebar, paths } from "@/app/routes"
import { CreateClubDialog } from "@/features/clubs/components/create-club-dialog"
import { useClubs, useCreateClub, useRefreshClubs } from "@/features/clubs/hooks/use-clubs"
import type { ClubSort } from "@/features/clubs/types/club.types"
import { usePlayersDirectory } from "@/features/players/hooks/use-players"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Escudo } from "@/components/ui/escudo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sidebar } from "@/components/ui/sidebar"

const MAX_CLUBS = 20
const SORTS: { value: ClubSort; label: string }[] = [
  { value: "name", label: "nome" },
  { value: "net_worth_desc", label: "patrimônio (maior para o menor)" },
  { value: "net_worth_asc", label: "patrimônio (menor para o maior)" },
]

const money = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function clubCountLabel(count: number) {
  return count === 1 ? "1 clube" : `${count} clubes`
}

function ClubsPage() {
  const navigate = useNavigate()
  const refreshClubs = useRefreshClubs()
  const createClub = useCreateClub()
  const [collapsed, setCollapsed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [sort, setSort] = useState<ClubSort>("net_worth_desc")
  const { clubs, isPending, error } = useClubs(sort)
  const { counts } = usePlayersDirectory({
    sort: "name",
    scope: "all",
    page: 1,
    limit: 10,
  })
  const sortLabel = SORTS.find((item) => item.value === sort)?.label ?? "nome"

  return (
    <div className="flex min-h-svh bg-sidebar text-foreground">
      <Sidebar
        active="Clubes"
        collapsed={collapsed}
        onHome={() => navigate(paths.home)}
        onNavigate={(label) => {
          const path = pathForSidebar(label)
          if (path) navigate(path)
        }}
        onCreateClub={() => setCreating(true)}
        counts={{ players: counts.all, clubs: clubs.length }}
        clubs={clubs.map((club) => ({
          initial: club.name.charAt(0),
          name: club.name,
          href: paths.club(club.id),
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
            <span className="text-foreground">Clubes</span>
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
          <div className="flex w-full items-center gap-[16px]">
            <div className="flex min-w-0 flex-1 items-center gap-[16px]">
              <span className="inline-flex size-[48px] shrink-0 items-center justify-center rounded-[12px] border border-primary bg-primary-soft text-primary">
                <Shield className="size-[22px]" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-[4px]">
                <h1 className="text-heading-page">Clubes</h1>
                <p className="text-body-sm text-muted-foreground">
                  Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes.
                </p>
              </div>
            </div>
            <Button type="button" className="h-[36px] gap-[8px] px-[16px]!" onClick={() => setCreating(true)}>
              <Plus />
              Novo clube
            </Button>
          </div>

          {error ? <Alert variant="destructive" description={error} /> : null}

          <section className="w-full overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border px-[16px] py-[12px]">
              <div className="flex items-center gap-[8px]">
                <p className="text-body-sm-medium">{clubCountLabel(clubs.length)}</p>
                <Badge variant="secondary">
                  {clubs.length} de {MAX_CLUBS}
                </Badge>
              </div>
              <Select
                value={sort}
                onValueChange={(value) => {
                  if (!value) return
                  setSort(value as ClubSort)
                }}
              >
                <SelectTrigger className="w-[338px]" aria-label="Ordenar por">
                  <ArrowUpDown className="size-4 text-muted-foreground" />
                  <SelectValue>{`Ordenar: ${sortLabel}`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <p className="px-2 py-1.5 text-caption-xs-medium text-muted-foreground">Ordenar por</p>
                  {SORTS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label.charAt(0).toLocaleUpperCase("pt-BR") + item.label.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
                  <tr className="h-[40px] bg-muted-subtle">
                    <th className="pr-[8px] pl-[16px] font-medium">Clube</th>
                    <th className="w-[90px] px-[8px] font-medium">Sigla</th>
                    <th className="w-[150px] px-[8px] text-right font-medium">Caixa</th>
                    <th className="w-[160px] px-[8px] text-right font-medium">Valor do elenco</th>
                    <th className="w-[160px] px-[8px] text-right font-medium">Patrimônio</th>
                    <th className="w-[140px] pr-[16px] pl-[8px]" />
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.id} className="h-[60px] border-b border-border last:border-b-0">
                      <td className="pr-[8px] pl-[16px]">
                        <span className="flex items-center gap-[12px]">
                          <Escudo sigla={club.acronym} />
                          <span className="text-body-sm-medium">{club.name}</span>
                        </span>
                      </td>
                      <td className="px-[8px]">
                        <Badge variant="outline">{club.acronym}</Badge>
                      </td>
                      <td className="px-[8px] text-right text-body-sm tabular-nums">{money.format(club.cash)}</td>
                      <td className="px-[8px] text-right text-body-sm tabular-nums">{money.format(club.squad_value)}</td>
                      <td className="px-[8px] text-right text-body-sm-semibold tabular-nums">{money.format(club.net_worth)}</td>
                      <td className="pr-[16px] pl-[8px] text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-[32px] gap-[6px] px-[12px]!"
                          onClick={() => navigate(paths.club(club.id))}
                        >
                          Ver clube
                          <ChevronRight className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isPending && clubs.length === 0 ? (
                <p className="px-4 py-6 text-body-sm text-muted-foreground">Nenhum clube cadastrado.</p>
              ) : null}
            </div>
          </section>
          <p className="text-caption-xs text-muted-foreground">
            Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor, com empate desfeito pelo nome.
          </p>
        </main>
        </div>
      </div>
      {creating ? (
        <CreateClubDialog
          onClose={() => setCreating(false)}
          onSubmit={async (input) => {
            const created = await createClub(input)
            navigate(paths.club(created.id), { state: { created: true } })
          }}
        />
      ) : null}
    </div>
  )
}

export { ClubsPage }
