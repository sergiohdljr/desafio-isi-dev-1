type MatchSide = {
  id: string
  name?: string
  complete: boolean
}

function incompleteClubs(sides: MatchSide[]) {
  const missing = sides.filter((side) => !side.complete)
  return {
    ids: missing.map((side) => side.id),
    names: missing.flatMap((side) => (side.name ? [side.name] : [])),
  }
}

export type { MatchSide }
export { incompleteClubs }
