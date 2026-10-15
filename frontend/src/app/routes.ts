const paths = {
  home: "/",
  players: "/jogadores",
  clubs: "/clubes",
  club: (id: number) => `/club/${id}`,
} as const

function pathForSidebar(label: string) {
  if (label === "Jogadores") return paths.players
  if (label === "Clubes") return paths.clubs
  return null
}

export { pathForSidebar, paths }
