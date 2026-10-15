const paths = {
  home: "/",
  players: "/jogadores",
} as const

function pathForSidebar(label: string) {
  if (label === "Jogadores") return paths.players
  return null
}

export { pathForSidebar, paths }
