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

type ClubDetail = Club & {
  players: { id: number; name: string }[]
}

export type { Club, ClubDetail, ClubSort, CreateClubInput }
export { CLUB_SORTS }
