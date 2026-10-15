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

export type { Club, ClubSort, CreateClubInput }
export { CLUB_SORTS }
