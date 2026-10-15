import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClub, listClubs } from "@/features/clubs/api/clubs.api"
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

export { useClubs, useCreateClub, useRefreshClubs }
