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
import { arrangePlayers } from "@/features/players/utils/arrange-players"

const PLAYERS_KEY = ["players"] as const
const PLAYERS_FETCH_LIMIT = 50

function usePlayersDirectory(query: DirectoryQuery) {
  const list = useQuery({
    queryKey: PLAYERS_KEY,
    queryFn: () => listPlayers({ limit: PLAYERS_FETCH_LIMIT }),
  })
  const directory = arrangePlayers(list.data?.data ?? [], query)
  const error = list.error

  return {
    players: directory.players,
    totalItems: directory.totalItems,
    totalPages: list.data ? directory.totalPages : 1,
    counts: directory.counts,
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
  queryClient.setQueryData<PlayerList>(PLAYERS_KEY, (current) => {
    if (!current) return current
    return {
      ...current,
      data: current.data.map((item) => (item.id === player.id ? player : item)),
    }
  })

  if (player.club_id == null || !previous) return
  const delta = player.market_value - previous.market_value

  queryClient.setQueriesData<Club[]>({ queryKey: ["clubs"] }, (current) => {
    if (!Array.isArray(current) || current.some((item) => !item || typeof item !== "object" || !("net_worth" in item) || "players" in item)) {
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
      const previous = queryClient.getQueryData<PlayerList>(PLAYERS_KEY)?.data.find((item) => item.id === id)
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
