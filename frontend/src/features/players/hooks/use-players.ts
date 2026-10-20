import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import type { Lineup } from "@/features/clubs/types/lineup.types"
import type { Club, ClubDetail } from "@/features/clubs/types/club.types"
import {
  buyPlayer,
  changePlayerCondition,
  createPlayer,
  deletePlayer,
  listPlayers,
  updatePlayer,
} from "@/features/players/api/players.api"
import type {
  Condition,
  CreatePlayerInput,
  DirectoryQuery,
  Player,
  PlayerList,
  UpdatePlayerInput,
} from "@/features/players/types/player.types"
const PLAYERS_KEY = ["players"] as const

function usePlayersDirectory(query: DirectoryQuery) {
  const filters = {
    search: query.search,
    position: query.position,
    condition: query.condition,
    clubId: query.clubId,
    minAge: query.minAge,
    maxAge: query.maxAge,
    minValue: query.minValue,
    maxValue: query.maxValue,
    sort: query.sort,
  }
  const free = query.scope === "free" ? true : query.scope === "signed" ? false : undefined
  const list = useQuery({
    queryKey: [...PLAYERS_KEY, filters, free ?? "all", query.page, query.limit],
    queryFn: () => listPlayers({ ...filters, free, page: query.page, limit: query.limit }),
  })
  const error = list.error

  return {
    players: list.data?.data ?? [],
    totalItems: list.data?.meta.total_items ?? 0,
    totalPages: list.data ? list.data.meta.total_pages : 1,
    counts: list.data?.meta.counts ?? { all: 0, free: 0, signed: 0 },
    isPending: list.isPending,
    error: error instanceof Error ? error.message : error ? "Não foi possível carregar os jogadores." : null,
  }
}

function useRefreshPlayers() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: PLAYERS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["clubs"] }),
    ])
}

function applyCondition(queryClient: QueryClient, previous: Player | undefined, player: Player) {
  queryClient.setQueriesData<PlayerList>({ queryKey: PLAYERS_KEY }, (current) => {
    if (!current) return current
    return {
      ...current,
      data: current.data.map((item) => (item.id === player.id ? player : item)),
    }
  })

  if (player.club_id == null || !previous) return
  const delta = player.market_value - previous.market_value

  queryClient.setQueriesData<Club[]>({ queryKey: ["clubs"] }, (current) => {
    if (
      !Array.isArray(current) ||
      current.some((item) => !item || typeof item !== "object" || !("net_worth" in item) || "players" in item)
    ) {
      return current
    }
    return current.map((club) =>
      club.id === player.club_id
        ? { ...club, squad_value: club.squad_value + delta, net_worth: club.net_worth + delta }
        : club,
    )
  })

  queryClient.setQueryData<ClubDetail>(["clubs", "detail", player.club_id], (current) => {
    if (!current) return current
    const players = current.players.map((item) => (item.id === player.id ? { ...item, ...player } : item))
    const squadValue = players.reduce((total, item) => total + item.market_value, 0)
    return { ...current, players, squad_value: squadValue, net_worth: current.cash + squadValue }
  })

  queryClient.setQueryData<Lineup>(["clubs", "lineup", player.club_id], (current) => {
    if (!current) return current
    if (player.condition === "DOENTE") {
      return {
        ...current,
        players: current.players.filter((item) => item.id !== player.id),
        complete: false,
      }
    }
    return {
      ...current,
      players: current.players.map((item) => (item.id === player.id ? player : item)),
    }
  })
}

function usePlayerMutations() {
  const queryClient = useQueryClient()
  const refresh = useRefreshPlayers()

  return {
    createPlayer: async (input: CreatePlayerInput) => {
      const player = await createPlayer(input)
      await refresh()
      return player
    },
    updatePlayer: async (id: number, input: UpdatePlayerInput) => {
      const player = await updatePlayer(id, input)
      await refresh()
      return player
    },
    changeCondition: async (id: number, condition: Condition) => {
      const previous = queryClient
        .getQueriesData<PlayerList>({ queryKey: PLAYERS_KEY })
        .flatMap(([, data]) => data?.data ?? [])
        .find((item) => item.id === id)
      const player = await changePlayerCondition(id, condition)
      applyCondition(queryClient, previous, player)
      return player
    },
    deletePlayer: async (id: number) => {
      await deletePlayer(id)
      await refresh()
    },
    buyPlayer: async (id: number, clubId: number, loyaltyUntil: string) => {
      const purchase = await buyPlayer(id, clubId, loyaltyUntil)
      await refresh()
      return purchase
    },
  }
}

export { usePlayerMutations, usePlayersDirectory, useRefreshPlayers }
