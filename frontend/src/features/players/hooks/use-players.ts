import { useQueryClient, useQueries } from "@tanstack/react-query"
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
  PlayerQuery,
  PlayerScope,
  UpdatePlayerInput,
} from "@/features/players/types/player.types"

const PLAYERS_KEY = ["players"] as const

type PlayersDirectoryQuery = Omit<PlayerQuery, "free" | "page" | "limit"> & {
  scope: PlayerScope
  page: number
  limit: number
}

function usePlayersDirectory(query: PlayersDirectoryQuery) {
  const free = query.scope === "free" ? true : query.scope === "signed" ? false : undefined
  const filters: PlayerQuery = {
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

  const [pageQuery, allQuery, freeQuery, signedQuery] = useQueries({
    queries: [
      {
        queryKey: [...PLAYERS_KEY, "page", { ...filters, free, page: query.page, limit: query.limit }],
        queryFn: () => listPlayers({ ...filters, free, page: query.page, limit: query.limit }),
      },
      {
        queryKey: [...PLAYERS_KEY, "count", "all", { ...filters, clubId: undefined }],
        queryFn: () => listPlayers({ ...filters, clubId: undefined, page: 1, limit: 1 }),
      },
      {
        queryKey: [...PLAYERS_KEY, "count", "free", { ...filters, clubId: undefined }],
        queryFn: () => listPlayers({ ...filters, clubId: undefined, free: true, page: 1, limit: 1 }),
      },
      {
        queryKey: [...PLAYERS_KEY, "count", "signed", filters],
        queryFn: () => listPlayers({ ...filters, free: false, page: 1, limit: 1 }),
      },
    ],
  })

  const error = pageQuery.error ?? allQuery.error ?? freeQuery.error ?? signedQuery.error

  return {
    players: pageQuery.data?.data ?? [],
    totalItems: pageQuery.data?.meta.total_items ?? 0,
    totalPages: pageQuery.data?.meta.total_pages ?? 1,
    counts: {
      all: allQuery.data?.meta.total_items ?? 0,
      free: freeQuery.data?.meta.total_items ?? 0,
      signed: signedQuery.data?.meta.total_items ?? 0,
    },
    isPending: pageQuery.isPending,
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

function usePlayerMutations() {
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
      const player = await changePlayerCondition(id, condition)
      await refresh()
      return player
    },
    deletePlayer: async (id: number) => {
      await deletePlayer(id)
      await refresh()
    },
    buyPlayer: async (id: number, clubId: number, loyaltyUntil: string) => {
      await buyPlayer(id, clubId, loyaltyUntil)
      await refresh()
    },
  }
}

export { usePlayerMutations, usePlayersDirectory, useRefreshPlayers }
