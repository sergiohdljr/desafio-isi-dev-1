import type { Player } from "@/features/players/types/player.types"

const CLUB_SORTS = ["name", "net_worth_desc", "net_worth_asc"] as const

type ClubSort = (typeof CLUB_SORTS)[number]

type Club = {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

type CreateClubInput = {
  name: string
  acronym: string
}

type ClubContract = {
  purchase_value: number
  loyalty_until: string
  remaining_days: number
}

type SquadPlayer = Player & {
  contract: ClubContract
}

type ClubDetail = Club & {
  players: SquadPlayer[]
}

export type { Club, ClubContract, ClubDetail, ClubSort, CreateClubInput, SquadPlayer }
export { CLUB_SORTS }
