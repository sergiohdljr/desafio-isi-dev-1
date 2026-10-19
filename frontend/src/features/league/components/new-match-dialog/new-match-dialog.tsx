import { useState, type FormEvent } from "react"
import { Info, Swords } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ClubField } from "@/features/league/components/new-match-dialog/club-field"
import { getLineup } from "@/features/clubs/api/clubs.api"
import { playMatch } from "@/features/league/api/league.api"
import { DIFFERENT_CLUBS_MESSAGE } from "@/features/league/consts/new-match"
import type { Match } from "@/features/league/types/match.types"
import { incompleteLineupMessage } from "@/features/league/utils/incomplete-lineup-message"
import { hasDifferentClubs, matchFailureKind } from "@/features/league/utils/match-failure"
import type { Club } from "@/features/clubs/types/club.types"
import { MarketDialog, PendingNote } from "@/features/players/components/market-dialog/index"

function NewMatchDialog({
  clubs,
  onClose,
  onPlayed,
}: {
  clubs: Club[]
  onClose: () => void
  onPlayed: (match: Match) => void
}) {
  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!hasDifferentClubs(homeId, awayId)) {
      setFailure(DIFFERENT_CLUBS_MESSAGE)
      return
    }
    setFailure(null)
    setPending(true)
    try {
      const match = await playMatch(Number(homeId), Number(awayId))
      onPlayed(match)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível jogar a partida."
      if (matchFailureKind(message) === "incomplete") {
        const incomplete = await incompleteSides(homeId, awayId, clubs)
        setInvalidIds(incomplete.ids)
        setFailure(incompleteLineupMessage(incomplete.names))
      } else {
        setInvalidIds([])
        setFailure(message)
      }
      setPending(false)
    }
  }

  const kind = matchFailureKind(failure)

  return (
    <MarketDialog
      title="Nova partida"
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {kind === "incomplete" || kind === "refused" ? (
          <Alert
            variant="destructive"
            title={kind === "incomplete" ? "Não foi possível jogar a partida" : "Partida recusada"}
            description={failure!}
          />
        ) : null}
        <ClubField
          label="Mandante"
          hint="Faz os 3 primeiros ataques."
          value={homeId}
          clubs={clubs}
          disabled={pending}
          invalid={invalidIds.includes(homeId)}
          onChange={(value) => {
            setHomeId(value)
            setInvalidIds([])
            setFailure(null)
          }}
        />
        <ClubField
          label="Visitante"
          hint="Precisa ser um clube diferente do mandante."
          value={awayId}
          clubs={clubs}
          disabled={pending}
          invalid={invalidIds.includes(awayId)}
          onChange={(value) => {
            setAwayId(value)
            setInvalidIds([])
            setFailure(null)
          }}
        />
        {kind === "selection" ? <p className="text-caption-xs text-destructive">{failure}</p> : null}
        <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted-subtle px-3.5 py-3 text-caption-xs text-muted-foreground">
          <p className="flex items-center gap-2 text-body-sm-medium text-foreground">
            <Info className="size-4" aria-hidden />
            Como sai o placar
          </p>
          <p>
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais recuado) ao 4º (o
            mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O atacante
            usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e quem defende usa defesa. É gol só quando o
            ataque é maior; mal condicionado joga com 15% a menos.
          </p>
          <p>Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
        </div>
        {pending ? <PendingNote>Jogando a partida. Os botões ficam desabilitados.</PendingNote> : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            <Swords />
            {pending ? "Jogando…" : "Jogar partida"}
          </Button>
        </div>
      </form>
    </MarketDialog>
  )
}

async function incompleteSides(homeId: string, awayId: string, clubs: Club[]) {
  const [home, away] = await Promise.all([readLineup(homeId), readLineup(awayId)])
  const sides = [
    { id: homeId, complete: home?.complete ?? false },
    { id: awayId, complete: away?.complete ?? false },
  ].filter((side) => !side.complete)
  const names = sides.flatMap((side) => {
    const club = clubs.find((item) => String(item.id) === side.id)
    return club ? [club.name] : []
  })
  return { ids: sides.map((side) => side.id), names }
}

function readLineup(id: string) {
  return getLineup(Number(id)).catch(() => null)
}

export { NewMatchDialog }
