import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClub, getClub, listClubTransactions, listClubs } from "@/features/clubs/api/clubs.api"
import type { ClubSort, CreateClubInput } from "@/features/clubs/types/club.types"

const CLUBS_KEY = ["clubs"] as const

function useClubs(sort: ClubSort = "name") {
  const query = useQuery({
    queryKey: [...CLUBS_KEY, sort],
    queryFn: () => listClubs(sort),
  })
  const error = query.error

  return {
    clubs: query.data ?? [],
    isPending: query.isPending,
    error: error instanceof Error ? error.message : error ? "Não foi possível carregar os clubes." : null,
  }
}

function useClub(id: number) {
  const query = useQuery({
    queryKey: [...CLUBS_KEY, "detail", id],
    queryFn: () => getClub(id),
    enabled: Number.isInteger(id) && id > 0,
  })
  const error = query.error

  return {
    club: query.data ?? null,
    isPending: query.isPending,
    error: error instanceof Error ? error.message : error ? "Não foi possível carregar o clube." : null,
  }
}

function useClubTransactions(id: number) {
  const query = useQuery({
    queryKey: [...CLUBS_KEY, "transactions", id],
    queryFn: () => listClubTransactions(id),
    enabled: Number.isInteger(id) && id > 0,
  })

  return {
    transactions: query.data?.data ?? [],
    summary: query.data?.summary ?? null,
    count: query.data?.data.length ?? 0,
    isPending: query.isPending,
    error: query.error instanceof Error ? query.error.message : query.error ? "Não foi possível carregar o histórico." : null,
  }
}

function useRefreshClubs() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: CLUBS_KEY })
}

function useCreateClub() {
  const refresh = useRefreshClubs()
  return async (input: CreateClubInput) => {
    const club = await createClub(input)
    await refresh()
    return club
  }
}

export { useClub, useClubTransactions, useClubs, useCreateClub, useRefreshClubs }
