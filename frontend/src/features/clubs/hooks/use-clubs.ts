import { useQuery } from "@tanstack/react-query"
import { listClubs } from "@/features/clubs/api/clubs.api"

function useClubs() {
  const query = useQuery({
    queryKey: ["clubs"],
    queryFn: listClubs,
  })

  return {
    clubs: query.data ?? [],
    isPending: query.isPending,
  }
}

export { useClubs }
