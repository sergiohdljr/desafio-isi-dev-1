import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpDown, CircleAlert, Coins, HeartPulse, Plus, Search, Shield, Shirt, UserRound, Users } from "lucide-react"
import { useAppChrome } from "@/app/app-layout"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ResourceEmpty, ResourceError, ResourceLoading } from "@/components/ui/resource-state"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toast, ToastViewport } from "@/components/ui/toast"
import { getLineup } from "@/features/clubs/api/clubs.api"
import { useClubs } from "@/features/clubs/hooks/use-clubs"
import {
  ActiveFilterChips,
  FilterSelect,
  PlayersDialogHost,
  PlayersPagination,
  PlayersTable,
  RangeFilter,
} from "@/features/players/components/players-directory"
import { AGE_MAX, AGE_MIN, PAGE_SIZE, SORTS, money } from "@/features/players/consts/directory"
import { CONDITIONS, POSITIONS } from "@/features/players/consts/player-options"
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from "@/features/players/consts/search"
import { usePlayerMutations, usePlayersDirectory, useRefreshPlayers } from "@/features/players/hooks/use-players"
import type { Condition, PlayerScope, PlayerSort, Position } from "@/features/players/types/player.types"
import type { ActiveFilter, PlayersDialog, PlayersNotice } from "@/features/players/types/players-ui.types"
import { optionalInteger, optionalMoney } from "@/features/players/utils/parse-filter"
import { pageRange } from "@/features/players/utils/page-range"
import { conditionLabel, positionLabel } from "@/features/players/utils/player-display"

function PlayersPage() {
  const { clubs } = useClubs()
  const refreshPlayers = useRefreshPlayers()
  useAppChrome({
    crumbs: [{ label: "Mercado" }, { label: "Jogadores" }],
    onRefresh: refreshPlayers,
  })
  const mutations = usePlayerMutations()
  const [scope, setScope] = useState<PlayerScope>("all")
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
  const [dialog, setDialog] = useState<PlayersDialog | null>(null)
  const [notice, setNotice] = useState<PlayersNotice | null>(null)
  const conditionPlayer = dialog?.type === "condition" ? dialog.player : null
  const lineup = useQuery({
    queryKey: ["clubs", "lineup", conditionPlayer?.club_id ?? 0],
    queryFn: () => getLineup(conditionPlayer!.club_id!),
    enabled: conditionPlayer?.club_id != null,
    refetchOnMount: "always",
  })
  const isStarter =
    conditionPlayer != null && (lineup.data?.players.some((item) => item.id === conditionPlayer.id) ?? false)
  const starterClub = isStarter ? (clubs.find((club) => club.id === conditionPlayer.club_id)?.name ?? "clube") : null

  useEffect(() => {
    const value = searchInput.trim()
    const timeout = window.setTimeout(() => {
      if (value.length === 1) return
      setSearch(value)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const parsedMinAge = optionalInteger(minAge, AGE_MIN, AGE_MAX)
  const parsedMaxAge = optionalInteger(maxAge, AGE_MIN, AGE_MAX)
  const parsedMinValue = optionalMoney(minValue)
  const parsedMaxValue = optionalMoney(maxValue)
  const ageInvalid = parsedMinAge !== undefined && parsedMaxAge !== undefined && parsedMinAge > parsedMaxAge
  const valueInvalid = parsedMinValue !== undefined && parsedMaxValue !== undefined && parsedMinValue > parsedMaxValue
  const appliedClubId = scope === "free" ? undefined : clubId ? Number(clubId) : undefined

  const { players, totalItems, totalPages, counts, isPending, error } = usePlayersDirectory({
    search: search.length >= SEARCH_MIN_LENGTH ? search : undefined,
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

  function finish(next: PlayersNotice) {
    setDialog(null)
    setNotice(next)
  }

  const { start: rangeStart, end: rangeEnd } = pageRange(page, PAGE_SIZE, totalItems)
  const sortLabel = SORTS.find((item) => item.value === sort)?.label ?? "nome"
  const ageSummary =
    parsedMinAge !== undefined || parsedMaxAge !== undefined
      ? `Idade: ${parsedMinAge ?? AGE_MIN} a ${parsedMaxAge ?? AGE_MAX}`
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
  ].filter((item): item is ActiveFilter => Boolean(item))

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
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
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
          <span className="group relative shrink-0">
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
            {scope === "free" ? (
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full left-0 z-20 mt-2 hidden items-center gap-1.5 rounded-md bg-black px-2.5 py-1.5 text-caption-xs whitespace-nowrap text-white group-hover:flex"
              >
                <CircleAlert className="size-3.5 shrink-0" aria-hidden />
                livres não combinam com filtro por clubes
              </span>
            ) : null}
          </span>
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
            align="end"
            onMinChange={setMinValue}
            onMaxChange={setMaxValue}
          />
        </div>

        {scope === "free" ? (
          <p className="text-caption-xs text-muted-foreground">
            Com a aba “Livres” ativa, o filtro por clube fica desabilitado, porque essa combinação não é aceita.
          </p>
        ) : null}
        <ActiveFilterChips
          filters={activeFilters}
          onClearAll={clearFilters}
          onClearOne={(clear) => {
            clear()
            setPage(1)
          }}
        />
        {ageInvalid ? <Alert variant="warning" description="A idade mínima não pode ser maior que a máxima." /> : null}
        {valueInvalid ? (
          <Alert variant="warning" description="O valor mínimo não pode ser maior que o máximo." />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={scope}
            onValueChange={(value) => {
              setScope(value as PlayerScope)
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

        {error ? (
          <ResourceError
            title="Não foi possível carregar os jogadores"
            description={error}
            onRetry={() => void refreshPlayers()}
          />
        ) : isPending ? (
          <ResourceLoading />
        ) : players.length === 0 ? (
          <ResourceEmpty
            title={search ? `Nenhum jogador encontrado para “${search}”` : "Nenhum jogador cadastrado"}
            description={
              search || position || condition || clubId || minAge || maxAge || minValue || maxValue
                ? "Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas e acentos."
                : "Com o banco recém-criado, a lista começa vazia."
            }
            action={
              search || position || condition || clubId || minAge || maxAge || minValue || maxValue ? (
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => setDialog({ type: "create" })}>
                  Novo jogador
                </Button>
              )
            }
          />
        ) : (
          <PlayersTable
            players={players}
            clubs={clubs}
            pending={false}
            onDetails={(player) => setDialog({ type: "details", player })}
            onEdit={(player) => setDialog({ type: "edit", player })}
            onCondition={(player) => setDialog({ type: "condition", player })}
            onBuy={(player) => setDialog({ type: "buy", player })}
            onDelete={(player) => setDialog({ type: "delete", player })}
          />
        )}

        <PlayersPagination
          page={page}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={totalItems}
          onPageChange={setPage}
        />
        <p className="text-caption-xs text-muted-foreground">
          Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas, minúsculas e acentos.
        </p>
      </main>

      <PlayersDialogHost
        dialog={dialog}
        clubs={clubs}
        starterClub={starterClub}
        mutations={mutations}
        onClose={() => setDialog(null)}
        onFinish={finish}
        onOpen={setDialog}
      />
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

export { PlayersPage }
