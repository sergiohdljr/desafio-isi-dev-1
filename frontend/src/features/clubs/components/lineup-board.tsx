import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, CircleCheck, HeartPulse, Plus, Swords, TriangleAlert } from "lucide-react"
import { getLineup, listClubTransactions, saveLineup } from "@/features/clubs/api/clubs.api"
import type { Formation } from "@/features/clubs/types/lineup.types"
import type { SquadPlayer } from "@/features/clubs/types/club.types"
import type { Condition, Player, Position } from "@/features/players/types/player.types"
import formation31 from "@/assets/formations/3-1.svg"
import formation22 from "@/assets/formations/2-2.svg"
import formation211 from "@/assets/formations/2-1-1.svg"
import formation121 from "@/assets/formations/1-2-1.svg"
import { Alert } from "@/components/ui/alert"
import { Toast, ToastViewport } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FORMATIONS: { value: Formation; note: string; diagram: string }[] = [
  { value: "3-1", note: "Defesa 3, ataque 1", diagram: formation31 },
  { value: "2-2", note: "Defesa 2, ataque 2", diagram: formation22 },
  { value: "2-1-1", note: "Defesa 2, meio 1, ataque 1", diagram: formation211 },
  { value: "1-2-1", note: "Defesa 1, meio 2, ataque 1", diagram: formation121 },
]

type SlotKind = "GOL" | "DEF" | "MEI" | "ATA"

const SLOTS: Record<Formation, { kind: SlotKind; label: string; hint: string }[]> = {
  "3-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-2": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "2-1-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
  "1-2-1": [
    { kind: "GOL", label: "Goleiro", hint: "GOL" },
    { kind: "DEF", label: "Defesa", hint: "ZAG ou LAT" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "MEI", label: "Meio", hint: "MEI" },
    { kind: "ATA", label: "Ataque", hint: "ATA" },
  ],
}

const PITCH: Record<Formation, { top: string; left: string }[]> = {
  "3-1": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "18%" },
    { top: "52%", left: "50%" },
    { top: "52%", left: "82%" },
    { top: "16%", left: "50%" },
  ],
  "2-2": [
    { top: "78%", left: "50%" },
    { top: "52%", left: "30%" },
    { top: "52%", left: "70%" },
    { top: "18%", left: "30%" },
    { top: "18%", left: "70%" },
  ],
  "2-1-1": [
    { top: "84%", left: "50%" },
    { top: "66%", left: "28%" },
    { top: "66%", left: "72%" },
    { top: "46%", left: "50%" },
    { top: "22%", left: "50%" },
  ],
  "1-2-1": [
    { top: "78%", left: "50%" },
    { top: "56%", left: "50%" },
    { top: "36%", left: "28%" },
    { top: "36%", left: "72%" },
    { top: "14%", left: "50%" },
  ],
}

const STARTER_COUNT = 5
const DEFAULT_FORMATION: Formation = "2-1-1"
const LINE_PLAYERS_NEEDED = 4

function incompleteLineupNotice({
  clubName,
  formation,
  savedCount,
  squad,
  sales,
}: {
  clubName: string
  formation: Formation | null
  savedCount: number
  squad: SquadPlayer[]
  sales: { player_id: number; player_name: string; type: string; created_at: string }[]
}) {
  if (!formation || savedCount >= STARTER_COUNT) return null
  const sold = sales
    .filter((item) => item.type === "VENDA" && !squad.some((player) => player.id === item.player_id))
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0]
  const sickLine = squad.filter((player) => player.position !== "GOL" && player.condition === "DOENTE")
  const eligibleLine = squad.filter((player) => player.position !== "GOL" && player.condition !== "DOENTE")
  const saleText = sold
    ? `${sold.player_name} foi vendido e saiu da escalação: a ${formation} continua salva, com ${savedCount} ${savedCount === 1 ? "titular" : "titulares"}.`
    : `A ${formation} continua salva, com ${savedCount} ${savedCount === 1 ? "titular" : "titulares"}.`
  const blocked =
    sickLine.length > 0 && eligibleLine.length < LINE_PLAYERS_NEEDED
      ? ` Com o ${sickLine.map((player) => player.name).join(" e ")} DOENTE, sobram ${eligibleLine.length} jogadores de linha que podem ser escalados, e nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.`
      : ""
  return {
    title: `Escalação incompleta: o ${clubName} não pode jogar partidas`,
    description: `${saleText}${blocked}`,
  }
}

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
        {refusal ? (
          <Alert variant="destructive" title="A escalação foi recusada" description={refusal} />
        ) : null}
        {incompleteNotice ? (
          <Alert variant="warning" title={incompleteNotice.title} description={incompleteNotice.description} />
        ) : !lineup.isPending && !complete ? (
          <Alert
            variant="warning"
            title={`Escalação incompleta: o ${clubName} não pode jogar partidas`}
            description={`O elenco tem ${squad.length} ${squad.length === 1 ? "jogador" : "jogadores"}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`}
          />
        ) : null}
        <div className="-mx-4 flex flex-col gap-2.5 border-b border-border px-5 py-4">
          <div>
            <h3 className="text-body-sm-medium">Formação</h3>
            <p className="text-caption-xs text-muted-foreground">
              Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da conta.
            </p>
          </div>
          <RadioGroup
            value={formation}
            onValueChange={(value) => {
              if (value === "3-1" || value === "2-2" || value === "2-1-1" || value === "1-2-1") {
                chooseFormation(value)
              }
            }}
            className="grid grid-cols-2 gap-3 xl:grid-cols-4"
            aria-label="Formação"
          >
            {FORMATIONS.map((item) => {
              const selected = item.value === formation
              return (
                <label
                  key={item.value}
                  className={
                    selected
                      ? "flex gap-2 rounded-lg border-2 border-primary bg-primary-soft px-3 py-2.5"
                      : "flex gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                  }
                >
                  <img src={item.diagram} alt="" width={40} height={52} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <RadioGroupItem value={item.value} />
                      <span className={selected ? "text-body-sm-semibold text-primary-soft-foreground" : "text-body-sm-semibold"}>
                        {item.value}
                      </span>
                    </span>
                    <span className="block text-caption-xs text-muted-foreground">{item.note}</span>
                  </span>
                </label>
              )
            })}
          </RadioGroup>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="border-b border-border text-body-sm-medium text-muted-foreground">
              <tr className="h-10 bg-muted-subtle">
                <th className="pr-2 pl-4 font-medium">Vaga</th>
                <th className="px-2 font-medium">Titular</th>
                <th className="w-[160px] px-2 font-medium">Condição</th>
                <th className="w-[80px] px-2 font-medium">Overall</th>
                <th className="pr-4 pl-2 font-medium">Atributos usados</th>
              </tr>
            </thead>
            <tbody>
              {SLOTS[formation].map((slot, index) => {
                const player = chosen[index]
                const options = squad.filter(
                  (item) =>
                    fits(slot.kind, item.position) &&
                    (item.id === player?.id || !starters.includes(item.id)),
                )
                return (
                  <tr key={`${slot.kind}-${index}`} className="h-[60px] border-b border-border last:border-b-0">
                    <td className="pr-2 pl-4">
                      <span className="block text-body-sm-medium">{slot.label}</span>
                      <span className="block text-caption-xs text-muted-foreground">{slot.hint}</span>
                    </td>
                    <td className="px-2">
                      <Select
                        value={player ? String(player.id) : null}
                        onValueChange={(value) => {
                          if (!value) return
                          const next = squad.find((item) => item.id === Number(value))
                          if (!next) return
                          if (next.condition === "DOENTE") {
                            setRefusal(`${next.name} está DOENTE e não pode ser escalado.`)
                            return
                          }
                          setRefusal(null)
                          setStarters((current) =>
                            current.map((id, slotIndex) => (slotIndex === index ? next.id : id)),
                          )
                        }}
                      >
                        <SelectTrigger className="w-full max-w-[240px]" aria-label={slot.label}>
                          <SelectValue placeholder={options.length === 0 ? `Sem ${slot.hint}` : "Escolher"}>
                            {player ? `${player.name} (${player.position})` : options.length === 0 ? `Sem ${slot.hint}` : "Escolher"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                              {option.name} ({option.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2">
                      {player ? (
                        <Badge variant={conditionVariant(player.condition)} dot>
                          {conditionLabel(player.condition)}
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-2 text-body-sm-semibold tabular-nums">{player?.overall ?? ""}</td>
                    <td className="pr-4 pl-2 text-body-sm text-muted-foreground">{player ? usedAttributes(player) : ""}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.
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
        <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-heading-card">Em campo</h2>
            <p className="text-caption-xs text-muted-foreground">
              {savedFormation && !complete
                ? `Prévia da formação ${savedFormation} salva; a vaga vazia fica tracejada.`
                : `Prévia da formação ${formation}, do goleiro ao ataque.`}
            </p>
          </header>
          <div className="p-4">
            <div className="relative h-[360px] overflow-hidden rounded-[10px] bg-pitch" aria-hidden>
              <span className="absolute inset-x-0 top-10 h-10 bg-pitch-stripe" />
              <span className="absolute inset-x-0 top-[120px] h-10 bg-pitch-stripe" />
              <span className="absolute inset-x-0 top-[200px] h-10 bg-pitch-stripe" />
              <span className="absolute inset-x-0 top-[280px] h-10 bg-pitch-stripe" />
              <svg className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox="0 0 260 336" fill="none">
                <rect x="1" y="1" width="258" height="334" stroke="white" strokeOpacity="0.75" />
                <line x1="1" y1="168" x2="259" y2="168" stroke="white" strokeOpacity="0.75" />
                <circle cx="130" cy="168" r="28" stroke="white" strokeOpacity="0.75" />
                <rect x="70" y="250" width="120" height="85" stroke="white" strokeOpacity="0.75" />
                <rect x="100" y="308" width="60" height="27" stroke="white" strokeOpacity="0.75" />
              </svg>
              {SLOTS[formation].map((slot, index) => {
                const player = chosen[index]
                return (
                  <span
                    key={`${slot.kind}-${index}`}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                    style={{ top: PITCH[formation][index].top, left: PITCH[formation][index].left }}
                  >
                    {player ? (
                      <span className="relative inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-caption-xs-medium text-primary-foreground shadow-md">
                        {initials(player.name)}
                        {player.condition === "MAL_CONDICIONADO" ? (
                          <span className="absolute -top-1.5 -left-1.5 inline-flex size-4 items-center justify-center rounded-full border-[1.5px] border-background bg-warning text-white">
                            <HeartPulse className="size-2.5" />
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center rounded-full border-[1.5px] border-dashed border-pitch-line text-pitch-line">
                        <Plus className="size-3.5" />
                      </span>
                    )}
                    <span
                      className={
                        player
                          ? "rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium text-pitch-foreground"
                          : "rounded-full bg-pitch-label px-2 py-0.5 text-caption-xs-medium text-pitch-muted-foreground"
                      }
                    >
                      {player ? lastName(player.name) : slot.label}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
          <footer className="flex items-start gap-2 border-t border-border bg-muted-subtle px-4 py-3">
            <Swords className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-caption-xs text-muted-foreground">
              Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados. É gol quando o ataque é maior que a defesa.
            </p>
          </footer>
        </section>
        <section className="rounded-[12px] border border-border bg-card p-4 shadow-xs">
          <h2 className="text-body-sm-semibold">Reservas</h2>
          <p className="mb-3 text-caption-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
          <ul className="flex flex-col gap-2">
            {reserves.map((player) => (
              <li key={player.id} className="flex items-center justify-between gap-2">
                <span>
                  <span className="block text-body-sm-medium">{player.name}</span>
                  <span className="block text-caption-xs text-muted-foreground">{positionLabel(player.position)}</span>
                </span>
                <Badge variant={conditionVariant(player.condition)} dot>
                  {conditionLabel(player.condition)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption-xs text-muted-foreground">Doente não pode ser escalado.</p>
        </section>
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

function emptyStarters() {
  return Array.from({ length: STARTER_COUNT }, () => null)
}

function placeStarters(formation: Formation, players: Player[]) {
  const remaining = [...players]
  return SLOTS[formation].map((slot) => {
    const index = remaining.findIndex((player) => fits(slot.kind, player.position))
    if (index < 0) return null
    const [player] = remaining.splice(index, 1)
    return player.id
  })
}

function fits(kind: SlotKind, position: Position) {
  if (kind === "DEF") return position === "ZAG" || position === "LAT"
  return position === kind
}

function usedAttributes(player: SquadPlayer) {
  if (player.position === "ATA") return `Finalização ${player.shooting}`
  if (player.position === "MEI") return `Passe ${player.passing}`
  if (player.position === "LAT") return `Drible ${player.dribbling} Defesa ${player.defending}`
  return `Defesa ${player.defending}`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return `${first}${last}`.toLocaleUpperCase("pt-BR")
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? name
}

function positionLabel(position: Position) {
  if (position === "GOL") return "Goleiro"
  if (position === "ZAG") return "Zagueiro"
  if (position === "LAT") return "Lateral"
  if (position === "MEI") return "Meio-campo"
  return "Atacante"
}

function conditionLabel(condition: Condition) {
  if (condition === "APTO") return "Apto"
  if (condition === "MAL_CONDICIONADO") return "Mal condicionado"
  return "Doente"
}

function conditionVariant(condition: Condition) {
  if (condition === "APTO") return "success" as const
  if (condition === "MAL_CONDICIONADO") return "warning" as const
  return "destructive" as const
}

export { LineupBoard }
