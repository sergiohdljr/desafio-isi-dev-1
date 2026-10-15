import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  buyPlayer,
  changePlayerCondition,
  createPlayer,
  deletePlayer,
  listPlayers,
  updatePlayer,
} from "@/features/players/api/players.api"
import { arrangePlayers, type DirectoryQuery } from "@/features/players/lib/arrange-players"
import type { Condition, CreatePlayerInput, UpdatePlayerInput } from "@/features/players/types/player.types"

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
