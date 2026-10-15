import { useEffect, useRef, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAppChrome } from "@/app/app-layout"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  HeartPulse,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  Shirt,
  UserRound,
  Users,
  X,
} from "lucide-react"
import { getLineup } from "@/features/clubs/api/clubs.api"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import { AVATAR_TONES, PAGE_SIZE, SORTS, money } from "@/features/players/consts/directory"
import { usePlayerMutations, usePlayersDirectory, useRefreshPlayers } from "@/features/players/hooks/use-players"
import type { Condition, Player, PlayerSort, Position } from "@/features/players/types/player.types"
import { agilityTone, conditionLabel, initials, positionLabel } from "@/features/players/utils/player-display"
import { optionalInteger, optionalMoney } from "@/features/players/utils/parse-filter"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaginationItem } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toast, ToastViewport } from "@/components/ui/toast"
import { PlayerActionsMenu } from "@/features/players/components/player-actions-menu"
import {
  BuyPlayerDialog,
  ConditionDialog,
  CreatePlayerDialog,
  DeletePlayerDialog,
  DetailsDialog,
  EditPlayerDialog,
} from "@/features/players/components/player-dialogs"
import { CONDITIONS, POSITIONS } from "@/features/players/consts/player-options"

type Scope = "all" | "free" | "signed"
type Dialog =
  | { type: "create" }
  | { type: "edit"; player: Player }
  | { type: "condition"; player: Player }
  | { type: "delete"; player: Player }
  | { type: "details"; player: Player }
  | { type: "buy"; player: Player }
type Notice = { variant: "success" | "error"; title: string; description?: string }

function PlayersPage() {
  const { clubs } = useClubs()
  const refreshPlayers = useRefreshPlayers()
  useAppChrome({
    crumbs: [{ label: "Mercado" }, { label: "Jogadores" }],
    onRefresh: refreshPlayers,
  })
  const mutations = usePlayerMutations()
  const [scope, setScope] = useState<Scope>("all")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState("")
  const [condition, setCondition] = useState("")
  const [clubId, setClubId] = useState("")
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  const [sort, setSort] = useState<PlayerSort>("name")
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const conditionPlayer = dialog?.type === "condition" ? dialog.player : null
  const lineup = useQuery({
    queryKey: ["clubs", "lineup", conditionPlayer?.club_id ?? 0],
    queryFn: () => getLineup(conditionPlayer!.club_id!),
    enabled: conditionPlayer?.club_id != null,
    refetchOnMount: "always",
  })
  const isStarter =
    conditionPlayer != null &&
    (lineup.data?.players.some((item) => item.id === conditionPlayer.id) ?? false)
  const starterClub = isStarter
    ? (clubs.find((club) => club.id === conditionPlayer.club_id)?.name ?? "clube")
    : null

  useEffect(() => {
    const value = searchInput.trim()
    const timeout = window.setTimeout(() => {
      if (value.length === 1) return
      setSearch(value)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const parsedMinAge = optionalInteger(minAge, 16, 45)
  const parsedMaxAge = optionalInteger(maxAge, 16, 45)
  const parsedMinValue = optionalMoney(minValue)
  const parsedMaxValue = optionalMoney(maxValue)
  const ageInvalid =
    parsedMinAge !== undefined && parsedMaxAge !== undefined && parsedMinAge > parsedMaxAge
  const valueInvalid =
    parsedMinValue !== undefined &&
    parsedMaxValue !== undefined &&
    parsedMinValue > parsedMaxValue
  const appliedClubId = scope === "free" ? undefined : clubId ? Number(clubId) : undefined

  const { players, totalItems, totalPages, counts, isPending, error } = usePlayersDirectory({
    search: search.length >= 2 ? search : undefined,
    position: (position || undefined) as Position | undefined,
    condition: (condition || undefined) as Condition | undefined,
    clubId: appliedClubId,
    minAge: ageInvalid ? undefined : parsedMinAge,
    maxAge: ageInvalid ? undefined : parsedMaxAge,
    minValue: valueInvalid ? undefined : parsedMinValue,
    maxValue: valueInvalid ? undefined : parsedMaxValue,
    sort,
    scope,
    page,
    limit: PAGE_SIZE,
  })

  function clearFilters() {
    setSearchInput("")
    setSearch("")
    setPosition("")
    setCondition("")
    setClubId("")
    setMinAge("")
    setMaxAge("")
    setMinValue("")
    setMaxValue("")
    setPage(1)
  }

  function finish(next: Notice) {
    setDialog(null)
    setNotice(next)
  }

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalItems)
  const sortLabel = SORTS.find((item) => item.value === sort)?.label ?? "nome"
  const ageSummary =
    parsedMinAge !== undefined || parsedMaxAge !== undefined
      ? `Idade: ${parsedMinAge ?? 16} a ${parsedMaxAge ?? 45}`
      : undefined
  const valueSummary =
    parsedMinValue !== undefined || parsedMaxValue !== undefined
      ? `Valor: ${money.format(parsedMinValue ?? 0)} a ${money.format(parsedMaxValue ?? 0)}`
      : undefined
  const activeFilters = [
    condition
      ? {
          id: "condition",
          label: `Condição: ${conditionLabel(condition as Condition)}`,
          clear: () => setCondition(""),
        }
      : null,
    ageSummary
      ? {
          id: "age",
          label: ageSummary,
          clear: () => {
            setMinAge("")
            setMaxAge("")
          },
        }
      : null,
    valueSummary
      ? {
          id: "value",
          label: `Valor de mercado: ${money.format(parsedMinValue ?? 0)} a ${money.format(parsedMaxValue ?? 0)}`,
          clear: () => {
            setMinValue("")
            setMaxValue("")
          },
        }
      : null,
    appliedClubId
      ? {
          id: "club",
          label: `Clube: ${clubs.find((club) => club.id === appliedClubId)?.name ?? ""}`,
          clear: () => setClubId(""),
        }
      : null,
    position
      ? {
          id: "position",
          label: `Posição: ${positionLabel(position as Position)}`,
          clear: () => setPosition(""),
        }
      : null,
    search
      ? {
          id: "search",
          label: `Busca: ${search}`,
          clear: () => {
            setSearchInput("")
            setSearch("")
          },
        }
      : null,
  ].filter((item): item is { id: string; label: string; clear: () => void } => Boolean(item))

  return (
    <>
        <main className="flex flex-1 flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
                <Users className="size-[22px]" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-heading-page">Jogadores</h1>
                <p className="text-body-sm text-muted-foreground">
                  Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.
                </p>
              </div>
            </div>
            <Button type="button" onClick={() => setDialog({ type: "create" })}>
              <Plus />
              Novo jogador
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-xs">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                className="pl-9"
                placeholder="Buscar por nome"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Buscar jogador pelo nome"
              />
            </div>
            <FilterSelect
              label="Posição"
              icon={<Shirt className="size-4" />}
              value={position}
              onChange={(value) => {
                setPosition(value)
                setPage(1)
              }}
              options={POSITIONS.map((item) => ({ value: item.value, label: item.label }))}
            />
            <FilterSelect
              label="Condição"
              icon={<HeartPulse className="size-4" />}
              value={condition}
              onChange={(value) => {
                setCondition(value)
                setPage(1)
              }}
              options={CONDITIONS.map((item) => ({ value: item.value, label: item.label }))}
            />
            <FilterSelect
              label="Clube"
              icon={<Shield className="size-4" />}
              value={scope === "free" ? "" : clubId}
              disabled={scope === "free"}
              onChange={(value) => {
                setClubId(value)
                setPage(1)
              }}
              options={clubs.map((club) => ({ value: String(club.id), label: club.name }))}
            />
            <RangeFilter
              label="Idade"
              valueLabel={ageSummary}
              icon={<UserRound className="size-4" />}
              min={minAge}
              max={maxAge}
              onMinChange={setMinAge}
              onMaxChange={setMaxAge}
            />
            <RangeFilter
              label="Valor"
              valueLabel={valueSummary}
              icon={<Coins className="size-4" />}
              min={minValue}
              max={maxValue}
              onMinChange={setMinValue}
              onMaxChange={setMaxValue}
            />
          </div>

          {scope === "free" ? (
            <p className="text-caption-xs text-muted-foreground">
              Com a aba “Livres” ativa, o filtro por clube fica desabilitado, porque essa combinação não é aceita.
            </p>
          ) : null}
          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap content-center items-center gap-2">
              <p className="text-body-sm text-muted-foreground">Filtros ativos:</p>
              {activeFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2.5 text-caption-xs-medium text-secondary-foreground"
                >
                  {filter.label}
                  <button
                    type="button"
                    className="inline-flex size-5 items-center justify-center rounded-md"
                    aria-label={`Remover filtro ${filter.label}`}
                    onClick={() => {
                      filter.clear()
                      setPage(1)
                    }}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              ))}
              <Button type="button" variant="link" size="sm" className="h-8 px-3" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : null}
          {ageInvalid ? (
            <Alert variant="warning" description="A idade mínima não pode ser maior que a máxima." />
          ) : null}
          {valueInvalid ? (
            <Alert variant="warning" description="O valor mínimo não pode ser maior que o máximo." />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={scope}
              onValueChange={(value) => {
                setScope(value as Scope)
                setPage(1)
              }}
            >
              <TabsList>
                <TabsTrigger value="all">Todos {counts.all}</TabsTrigger>
                <TabsTrigger value="free">Livres {counts.free}</TabsTrigger>
                <TabsTrigger value="signed">Em clubes {counts.signed}</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (!value) return
                setSort(value as PlayerSort)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-auto" aria-label="Ordenar por">
                <ArrowUpDown className="size-4 text-muted-foreground" />
                <SelectValue>{`Ordenar: ${sortLabel}`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? <Alert variant="destructive" description={error} /> : null}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-240 border-collapse text-left">
              <thead className="border-b border-border text-caption-xs-medium text-muted-foreground">
                <tr>
                  {["Jogador", "Posição", "Overall", "Agilidade", "Idade", "Condição", "Valor base", "Valor de mercado", "Clube", ""].map((heading) => (
                    <th key={heading || "acoes"} className="px-3 py-2 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const club = clubs.find((item) => item.id === player.club_id)
                  return (
                    <tr key={player.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={initials(player.name)}
                            className={AVATAR_TONES[player.id % AVATAR_TONES.length]}
                          />
                          <span>
                            <span className="block text-body-sm-medium">{player.name}</span>
                            <span className="block text-caption-xs text-muted-foreground">
                              {positionLabel(player.position)}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{player.position}</Badge>
                      </td>
                      <td className="px-3 py-2 text-body-sm tabular-nums">{player.overall}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2 text-body-sm tabular-nums">
                          {player.agility}
                          <span className="h-1 w-10 overflow-hidden rounded-full bg-muted" aria-hidden>
                            <span
                              className={`block h-full ${agilityTone(player.agility)}`}
                              style={{ width: `${player.agility}%` }}
                            />
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-body-sm tabular-nums">{player.age}</td>
                      <td className="px-3 py-2">
                        <Badge variant={conditionVariant(player.condition)} dot>
                          {conditionLabel(player.condition)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-body-sm text-muted-foreground tabular-nums">
                        {money.format(player.base_value)}
                      </td>
                      <td className="px-3 py-2 text-body-sm-medium tabular-nums">
                        {money.format(player.market_value)}
                      </td>
                      <td className="px-3 py-2">
                        {club ? (
                          <span className="flex items-center gap-2">
                            <span className="inline-flex h-5 items-center rounded-sm border border-border bg-muted px-1 text-caption-xs-medium">
                              {club.acronym}
                            </span>
                            <span className="text-body-sm underline underline-offset-2">{club.name}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="text-body-sm text-muted-foreground">Livre</span>
                            <Button type="button" variant="outline" size="sm" onClick={() => setDialog({ type: "buy", player })}>
                              <ShoppingCart />
                              Comprar
                            </Button>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <PlayerActionsMenu
                          player={player}
                          onDetails={() => setDialog({ type: "details", player })}
                          onEdit={() => setDialog({ type: "edit", player })}
                          onCondition={() => setDialog({ type: "condition", player })}
                          onBuy={() => setDialog({ type: "buy", player })}
                          onDelete={() => setDialog({ type: "delete", player })}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!isPending && players.length === 0 ? (
              <p className="px-3 py-6 text-body-sm text-muted-foreground">Nenhum jogador encontrado.</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-sm text-muted-foreground">
              Mostrando {rangeStart}–{rangeEnd} de {totalItems} jogadores
            </p>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                <ChevronLeft />
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7).map((item) => (
                <PaginationItem key={item} page={item} current={item === page} onClick={() => setPage(item)} />
              ))}
              <Button type="button" variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
                Próxima
                <ChevronRight />
              </Button>
            </div>
          </div>
          <p className="text-caption-xs text-muted-foreground">
            Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas, minúsculas e acentos.
          </p>
        </main>

      {dialog?.type === "create" ? (
        <CreatePlayerDialog
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const created = await mutations.createPlayer(input)
            finish({ variant: "success", title: "Jogador cadastrado", description: `${created.name} entrou livre e Apto.` })
          }}
        />
      ) : null}
      {dialog?.type === "edit" ? (
        <EditPlayerDialog
          player={dialog.player}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            await mutations.updatePlayer(dialog.player.id, input)
            finish({ variant: "success", title: "Jogador atualizado", description: "A linha mostra os dados devolvidos pela API." })
          }}
        />
      ) : null}
      {dialog?.type === "condition" ? (
        <ConditionDialog
          player={dialog.player}
          starterClub={starterClub}
          onClose={() => setDialog(null)}
          onSubmit={async (next) => {
            const updated = await mutations.changeCondition(dialog.player.id, next)
            finish({
              variant: "success",
              title: "Condição alterada",
              description: `${updated.name} agora está ${conditionLabel(updated.condition)}. Valor de mercado: ${money.format(updated.market_value)}.`,
            })
          }}
        />
      ) : null}
      {dialog?.type === "delete" ? (
        <DeletePlayerDialog
          player={dialog.player}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            const name = dialog.player.name
            await mutations.deletePlayer(dialog.player.id)
            finish({
              variant: "success",
              title: "Jogador excluído",
              description: `${name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
            })
          }}
        />
      ) : null}
      {dialog?.type === "details" ? (
        <DetailsDialog
          player={dialog.player}
          clubName={clubs.find((club) => club.id === dialog.player.club_id)?.name}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ type: "edit", player: dialog.player })}
          onCondition={() => setDialog({ type: "condition", player: dialog.player })}
          onBuy={dialog.player.club_id === null ? () => setDialog({ type: "buy", player: dialog.player }) : undefined}
        />
      ) : null}
      {dialog?.type === "buy" ? (
        <BuyPlayerDialog
          player={dialog.player}
          clubs={clubs}
          onClose={() => setDialog(null)}
          onSubmit={(nextClubId, loyaltyUntil) => mutations.buyPlayer(dialog.player.id, nextClubId, loyaltyUntil)}
        />
      ) : null}
      {notice ? (
        <ToastViewport>
          <Toast
            variant={notice.variant}
            title={notice.title}
            description={notice.description}
            onClose={() => setNotice(null)}
          />
        </ToastViewport>
      ) : null}
    </>
  )
}

function conditionVariant(condition: Condition) {
  if (condition === "APTO") return "success" as const
  if (condition === "MAL_CONDICIONADO") return "warning" as const
  return "destructive" as const
}

function FilterSelect({
  label,
  icon,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string
  icon: ReactNode
  value: string
  options: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <Select value={value || null} onValueChange={(next) => onChange(!next || next === "all" ? "" : next)} disabled={disabled}>
      <SelectTrigger className="w-auto shrink-0" aria-label={label}>
        <span className="text-muted-foreground">{icon}</span>
        <SelectValue placeholder={label}>{selected ? `${label}: ${selected.label}` : null}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RangeFilter({
  label,
  valueLabel,
  icon,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string
  valueLabel?: string
  icon: ReactNode
  min: string
  max: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", closeOnOutside)
    return () => document.removeEventListener("pointerdown", closeOnOutside)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-body-sm shadow-xs outline-none hover:border-ring focus-visible:border-ring focus-visible:shadow-focus"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className={valueLabel ? "text-foreground" : "text-muted-foreground"}>{valueLabel ?? label}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </button>
      {open ? (
        <div className="absolute top-11 z-10 flex w-56 flex-col gap-2 rounded-lg border border-border bg-popover p-3 shadow-md">
          <label className="flex flex-col gap-1 text-caption-xs text-muted-foreground">
            Mínimo
            <Input value={min} onChange={(event) => onMinChange(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-caption-xs text-muted-foreground">
            Máximo
            <Input value={max} onChange={(event) => onMaxChange(event.target.value)} />
          </label>
        </div>
      ) : null}
    </div>
  )
}

export { PlayersPage }
