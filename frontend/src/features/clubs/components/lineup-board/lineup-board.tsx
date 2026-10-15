import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, CircleCheck, TriangleAlert } from "lucide-react"
import { getLineup, listClubTransactions, saveLineup } from "@/features/clubs/api/clubs.api"
import { FormationPicker } from "@/features/clubs/components/lineup-board/formation-picker"
import { LineupPitch } from "@/features/clubs/components/lineup-board/lineup-pitch"
import { ReservesList } from "@/features/clubs/components/lineup-board/reserves-list"
import { StartersTable } from "@/features/clubs/components/lineup-board/starters-table"
import { DEFAULT_FORMATION } from "@/features/clubs/consts/lineup"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Formation } from "@/features/clubs/types/lineup.types"
import { incompleteLineupNotice } from "@/features/clubs/utils/incomplete-lineup-notice"
import { emptyStarters, placeStarters } from "@/features/clubs/utils/place-starters"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Toast, ToastViewport } from "@/components/ui/toast"

function LineupBoard({
  clubId,
  clubName,
  squad,
}: {
  clubId: number
  clubName: string
  squad: SquadPlayer[]
}) {
  const queryClient = useQueryClient()
  const lineup = useQuery({
    queryKey: ["clubs", "lineup", clubId],
    queryFn: () => getLineup(clubId),
  })
  const transactions = useQuery({
    queryKey: ["clubs", "transactions", clubId],
    queryFn: () => listClubTransactions(clubId),
  })
  const [formation, setFormation] = useState<Formation>(DEFAULT_FORMATION)
  const [starters, setStarters] = useState<(number | null)[]>(emptyStarters())
  const [saved, setSaved] = useState<{ formation: Formation; starters: (number | null)[] } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<string | null>(null)

  useEffect(() => {
    if (!lineup.data) return
    const nextFormation = lineup.data.formation ?? DEFAULT_FORMATION
    const nextStarters = placeStarters(nextFormation, lineup.data.players)
    setFormation(nextFormation)
    setStarters(nextStarters)
    setSaved({ formation: nextFormation, starters: nextStarters })
  }, [lineup.data])

  const chosen = starters.map((id) => squad.find((player) => player.id === id) ?? null)
  const unfit = chosen.filter((player) => player?.condition === "MAL_CONDICIONADO")
  const complete = chosen.every((player) => player !== null)
  const reserves = squad.filter((player) => !starters.includes(player.id))
  const savedFormation = lineup.data?.formation ?? null
  const savedCount = lineup.data?.players.length ?? 0
  const incompleteNotice = incompleteLineupNotice({
    clubName,
    formation: savedFormation,
    savedCount,
    squad,
    sales: transactions.data?.data ?? [],
  })

  function chooseFormation(next: Formation) {
    const selected = starters
      .map((id) => squad.find((player) => player.id === id))
      .filter((player): player is SquadPlayer => player !== undefined)
    setFormation(next)
    setStarters(placeStarters(next, selected))
    setRefusal(null)
  }

  async function save() {
    if (!complete) return
    setPending(true)
    setError(null)
    try {
      const stored = await saveLineup(
        clubId,
        formation,
        chosen.map((player) => player!.id),
      )
      queryClient.setQueryData(["clubs", "lineup", clubId], stored)
      const nextStarters = placeStarters(formation, stored.players)
      setSaved({ formation, starters: nextStarters })
      setStarters(nextStarters)
      setSavedNotice(`${clubName} está escalado na formação ${formation}.`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar a escalação.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex flex-col gap-4 rounded-[12px] border border-border bg-card p-4 shadow-xs">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-body-sm-semibold">Titulares</h2>
            <p className="text-caption-xs text-muted-foreground">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
            </p>
          </div>
          {lineup.isPending ? null : complete ? (
            <Badge variant="success" icon={<CircleCheck className="size-3" />}>
              Completa
            </Badge>
          ) : (
            <Badge variant="warning" icon={<TriangleAlert className="size-3" />}>
              Incompleta
            </Badge>
          )}
        </header>
        {refusal ? <Alert variant="destructive" title="A escalação foi recusada" description={refusal} /> : null}
        {incompleteNotice ? (
          <Alert variant="warning" title={incompleteNotice.title} description={incompleteNotice.description} />
        ) : !lineup.isPending && !complete ? (
          <Alert
            variant="warning"
            title={`Escalação incompleta: o ${clubName} não pode jogar partidas`}
            description={`O elenco tem ${squad.length} ${squad.length === 1 ? "jogador" : "jogadores"}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`}
          />
        ) : null}
        <FormationPicker formation={formation} onChange={chooseFormation} />
        <StartersTable
          formation={formation}
          chosen={chosen}
          squad={squad}
          starters={starters}
          onSelect={(index, next) => {
            if (next.condition === "DOENTE") {
              setRefusal(`${next.name} está DOENTE e não pode ser escalado.`)
              return
            }
            setRefusal(null)
            setStarters((current) => current.map((id, slotIndex) => (slotIndex === index ? next.id : id)))
          }}
        />
        {unfit.length > 0 ? (
          <Alert
            variant="warning"
            title={`${unfit.map((player) => player!.name).join(" e ")} ${unfit.length === 1 ? "está" : "estão"} mal condicionados`}
            description="Podem jogar, mas cada atributo vale 15% a menos durante a partida."
          />
        ) : null}
        {error ? <p className="text-caption-xs text-destructive">{error}</p> : null}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="max-w-[420px] text-caption-xs text-muted-foreground">
            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar
            depois de escalar de novo.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!saved}
              onClick={() => {
                if (!saved) return
                setFormation(saved.formation)
                setStarters(saved.starters)
                setError(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={!complete || pending} onClick={() => void save()}>
              <Check />
              Salvar escalação
            </Button>
          </div>
        </footer>
      </section>
      <div className="flex flex-col gap-4">
        <LineupPitch
          formation={formation}
          chosen={chosen}
          complete={complete}
          savedFormation={savedFormation}
        />
        <ReservesList reserves={reserves} />
      </div>
      {savedNotice ? (
        <ToastViewport placement="top-end">
          <Toast
            variant="success"
            title="Escalação salva"
            description={savedNotice}
            onClose={() => setSavedNotice(null)}
          />
        </ToastViewport>
      ) : null}
    </div>
  )
}

export { LineupBoard }
