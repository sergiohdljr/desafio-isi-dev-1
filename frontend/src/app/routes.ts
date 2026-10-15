const paths = {
  home: "/",
  players: "/jogadores",
  clubs: "/clubes",
  club: (id: number) => `/club/${id}`,
  matches: "/partidas",
  match: (id: number) => `/partidas/${id}`,
  standings: "/classificacao",
} as const

function pathForSidebar(label: string) {
  if (label === "Jogadores") return paths.players
  if (label === "Clubes") return paths.clubs
  if (label === "Partidas") return paths.matches
  if (label === "Classificação") return paths.standings
  return null
}

export { pathForSidebar, paths }
